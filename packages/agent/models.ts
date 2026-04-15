import {
  createGateway,
  defaultSettingsMiddleware,
  gateway as aiGateway,
  wrapLanguageModel,
  type GatewayModelId,
  type JSONValue,
  type LanguageModel,
} from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createAnthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { createOpenAI, type OpenAIResponsesProviderOptions } from "@ai-sdk/openai";

const opencodeProvider = createOpenAI({
  baseURL: "https://opencode.ai/zen/v1",
  apiKey: process.env.OPENCODE_API_KEY ?? "",
});

const anthropicProvider = process.env.ANTHROPIC_API_KEY
  ? createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openaiDirectProvider = process.env.OPENAI_API_KEY
  ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function createOpencodeModel(modelId: string): LanguageModel {
  const modelName = modelId.replace(/^opencode\//, "");
  const model = opencodeProvider.chat(modelName) as unknown as LanguageModel;
  return wrapLanguageModel({
    model,
    middleware: defaultSettingsMiddleware({
      settings: { maxTokens: 16384 },
    }),
  });
}

function createDirectAnthropicModel(modelId: string): LanguageModel | null {
  if (!anthropicProvider) return null;
  const modelName = modelId.replace(/^anthropic\//, "");
  const settings = getAnthropicSettings(modelId);
  return anthropicProvider(modelName, settings) as unknown as LanguageModel;
}

function createDirectOpenAIModel(modelId: string): LanguageModel | null {
  if (!openaiDirectProvider) return null;
  const modelName = modelId.replace(/^openai\//, "");
  // GPT-5 and newer OpenAI models use the Responses API
  return openaiDirectProvider.responses(modelName) as unknown as LanguageModel;
}

// Models with 4.5+ support adaptive thinking with effort control.
// Older models use the legacy extended thinking API with a budget.
function getAnthropicSettings(modelId: string): AnthropicLanguageModelOptions {
  if (modelId.includes("4.6")) {
    return {
      effort: "medium",
      thinking: { type: "adaptive" },
    } satisfies AnthropicLanguageModelOptions;
  }

  return {
    thinking: { type: "enabled", budgetTokens: 8000 },
  };
}

function isJsonObject(value: unknown): value is Record<string, JSONValue> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toProviderOptionsRecord(
  options: Record<string, unknown>,
): Record<string, JSONValue> {
  return options as Record<string, JSONValue>;
}

function mergeRecords(
  base: Record<string, JSONValue>,
  override: Record<string, JSONValue>,
): Record<string, JSONValue> {
  const merged: Record<string, JSONValue> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existingValue = merged[key];

    if (isJsonObject(existingValue) && isJsonObject(value)) {
      merged[key] = mergeRecords(existingValue, value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

export type ProviderOptionsByProvider = Record<
  string,
  Record<string, JSONValue>
>;

export function mergeProviderOptions(
  defaults: ProviderOptionsByProvider,
  overrides?: ProviderOptionsByProvider,
): ProviderOptionsByProvider {
  if (!overrides || Object.keys(overrides).length === 0) {
    return defaults;
  }

  const merged: ProviderOptionsByProvider = { ...defaults };

  for (const [provider, providerOverrides] of Object.entries(overrides)) {
    const providerDefaults = merged[provider];

    if (!providerDefaults) {
      merged[provider] = providerOverrides;
      continue;
    }

    merged[provider] = mergeRecords(providerDefaults, providerOverrides);
  }

  return merged;
}

export interface GatewayConfig {
  baseURL: string;
  apiKey: string;
}

export interface GatewayOptions {
  devtools?: boolean;
  config?: GatewayConfig;
  providerOptionsOverrides?: ProviderOptionsByProvider;
}

export type { GatewayModelId, LanguageModel, JSONValue };

export function shouldApplyOpenAIReasoningDefaults(modelId: string): boolean {
  return modelId.startsWith("openai/gpt-5");
}

function shouldApplyOpenAITextVerbosityDefaults(modelId: string): boolean {
  return modelId.startsWith("openai/gpt-5.4");
}

export function getProviderOptionsForModel(
  modelId: string,
  providerOptionsOverrides?: ProviderOptionsByProvider,
): ProviderOptionsByProvider {
  const defaultProviderOptions: ProviderOptionsByProvider = {};

  // Apply anthropic defaults
  if (modelId.startsWith("anthropic/")) {
    defaultProviderOptions.anthropic = toProviderOptionsRecord(
      getAnthropicSettings(modelId),
    );
  }

  // OpenAI model responses should never be persisted.
  if (modelId.startsWith("openai/")) {
    defaultProviderOptions.openai = toProviderOptionsRecord({
      store: false,
    } satisfies OpenAIResponsesProviderOptions);
  }

  // Apply OpenAI defaults for all GPT-5 variants to expose encrypted reasoning content.
  // This avoids Responses API failures when `store: false`, e.g.:
  // "Item with id 'rs_...' not found. Items are not persisted when `store` is set to false."
  if (shouldApplyOpenAIReasoningDefaults(modelId)) {
    defaultProviderOptions.openai = mergeRecords(
      defaultProviderOptions.openai ?? {},
      toProviderOptionsRecord({
        reasoningSummary: "detailed",
        include: ["reasoning.encrypted_content"],
      } satisfies OpenAIResponsesProviderOptions),
    );
  }

  if (shouldApplyOpenAITextVerbosityDefaults(modelId)) {
    defaultProviderOptions.openai = mergeRecords(
      defaultProviderOptions.openai ?? {},
      toProviderOptionsRecord({
        textVerbosity: "low",
      } satisfies OpenAIResponsesProviderOptions),
    );
  }

  const providerOptions = mergeProviderOptions(
    defaultProviderOptions,
    providerOptionsOverrides,
  );

  // Enforce OpenAI non-persistence even when custom provider overrides are present.
  if (modelId.startsWith("openai/")) {
    providerOptions.openai = mergeRecords(
      providerOptions.openai ?? {},
      toProviderOptionsRecord({
        store: false,
      } satisfies OpenAIResponsesProviderOptions),
    );
  }

  return providerOptions;
}

export function gateway(
  modelId: GatewayModelId | string,
  options: GatewayOptions = {},
): LanguageModel {
  const { devtools = false, config, providerOptionsOverrides } = options;

  // Route opencode/* models directly to the OpenCode Zen API
  if ((modelId as string).startsWith("opencode/")) {
    let model: LanguageModel = createOpencodeModel(modelId as string);
    if (devtools) {
      model = wrapLanguageModel({ model, middleware: devToolsMiddleware() });
    }
    return model;
  }

  // Route anthropic/* models directly to Anthropic API when key is available
  if ((modelId as string).startsWith("anthropic/")) {
    const directModel = createDirectAnthropicModel(modelId as string);
    if (directModel) {
      let model: LanguageModel = directModel;
      if (devtools) {
        model = wrapLanguageModel({ model, middleware: devToolsMiddleware() });
      }
      return model;
    }
  }

  // Route openai/* models directly to OpenAI API when key is available
  if ((modelId as string).startsWith("openai/")) {
    const directModel = createDirectOpenAIModel(modelId as string);
    if (directModel) {
      let model: LanguageModel = directModel;
      const providerOptions = getProviderOptionsForModel(modelId, providerOptionsOverrides);
      if (Object.keys(providerOptions).length > 0) {
        model = wrapLanguageModel({
          model,
          middleware: defaultSettingsMiddleware({ settings: { providerOptions } }),
        });
      }
      if (devtools) {
        model = wrapLanguageModel({ model, middleware: devToolsMiddleware() });
      }
      return model;
    }
  }

  // Use custom gateway config or default AI SDK gateway
  const baseGateway = config
    ? createGateway({ baseURL: config.baseURL, apiKey: config.apiKey })
    : aiGateway;

  let model: LanguageModel = baseGateway(modelId as GatewayModelId);

  const providerOptions = getProviderOptionsForModel(
    modelId,
    providerOptionsOverrides,
  );

  if (Object.keys(providerOptions).length > 0) {
    model = wrapLanguageModel({
      model,
      middleware: defaultSettingsMiddleware({
        settings: { providerOptions },
      }),
    });
  }

  // Apply devtools middleware if requested
  if (devtools) {
    model = wrapLanguageModel({ model, middleware: devToolsMiddleware() });
  }

  return model;
}
