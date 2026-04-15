import "server-only";

import { gateway } from "ai";
import { z } from "zod";
import { filterDisabledModels } from "./model-availability";
import type {
  AvailableModel,
  AvailableModelCost,
  AvailableModelCostTier,
  GatewayAvailableModel,
} from "./models";

const MODELS_DEV_URL = "https://models.dev/api.json";
const MODELS_DEV_TIMEOUT_MS = 750;

type GatewayModel = GatewayAvailableModel;

interface ModelsDevMetadata {
  contextWindow?: number;
  cost?: AvailableModelCost;
}

const recordSchema = z.object({}).catchall(z.unknown());

const gatewayModelSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    modelType: z.string().nullish(),
  })
  .passthrough();

const gatewayErrorSchema = z.object({
  response: z.object({
    models: z.array(z.unknown()),
  }),
});

const modelsDevLimitSchema = z
  .object({
    context: z.number().finite().positive().optional(),
  })
  .passthrough();

const modelsDevCostTierSchema = z
  .object({
    input: z.number().finite().optional(),
    output: z.number().finite().optional(),
    cache_read: z.number().finite().optional(),
  })
  .passthrough();

function getModelsFromGatewayError(error: unknown): GatewayModel[] | undefined {
  const parsed = gatewayErrorSchema.safeParse(error);
  if (!parsed.success) {
    return undefined;
  }

  const models = parsed.data.response.models.flatMap((model) => {
    const parsedModel = gatewayModelSchema.safeParse(model);
    return parsedModel.success ? [parsedModel.data] : [];
  });

  return models.length > 0 ? models : undefined;
}

function getModelsDevCostTier(
  value: unknown,
): AvailableModelCostTier | undefined {
  const parsed = modelsDevCostTierSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  const { input, output, cache_read } = parsed.data;
  if (input === undefined && output === undefined && cache_read === undefined) {
    return undefined;
  }

  return {
    input,
    output,
    cache_read,
  };
}

function getModelsDevCost(value: unknown): AvailableModelCost | undefined {
  const parsed = recordSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  const baseCost = getModelsDevCostTier(parsed.data);
  const contextOver200k = getModelsDevCostTier(parsed.data.context_over_200k);

  if (!baseCost && !contextOver200k) {
    return undefined;
  }

  return {
    ...baseCost,
    ...(contextOver200k ? { context_over_200k: contextOver200k } : {}),
  };
}

function getModelsDevMetadataMap(
  data: unknown,
): Map<string, ModelsDevMetadata> {
  const metadataMap = new Map<string, ModelsDevMetadata>();
  const providers = recordSchema.safeParse(data);
  if (!providers.success) {
    return metadataMap;
  }

  for (const [providerKey, providerValue] of Object.entries(providers.data)) {
    const provider = recordSchema.safeParse(providerValue);
    if (!provider.success) {
      continue;
    }

    const models = recordSchema.safeParse(provider.data.models);
    if (!models.success) {
      continue;
    }

    for (const [modelKey, modelValue] of Object.entries(models.data)) {
      const model = recordSchema.safeParse(modelValue);
      if (!model.success) {
        continue;
      }

      const parsedId = z.string().safeParse(model.data.id);
      const rawId = parsedId.success ? parsedId.data : modelKey;
      const modelId = rawId.includes("/") ? rawId : `${providerKey}/${rawId}`;

      const parsedLimit = modelsDevLimitSchema.safeParse(model.data.limit);
      const contextWindow = parsedLimit.success
        ? parsedLimit.data.context
        : undefined;
      const cost = getModelsDevCost(model.data.cost);

      if (contextWindow === undefined && cost === undefined) {
        continue;
      }

      metadataMap.set(modelId, {
        contextWindow,
        cost,
      });
    }
  }

  return metadataMap;
}

async function fetchModelsDevMetadataMap(): Promise<
  Map<string, ModelsDevMetadata>
> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODELS_DEV_TIMEOUT_MS);

  try {
    const response = await fetch(MODELS_DEV_URL, {
      signal: controller.signal,
    });
    if (!response.ok) {
      return new Map();
    }
    const data: unknown = await response.json();
    return getModelsDevMetadataMap(data);
  } catch {
    return new Map();
  } finally {
    clearTimeout(timeoutId);
  }
}

function addModelsDevMetadata(
  model: GatewayModel,
  metadataMap: Map<string, ModelsDevMetadata>,
): AvailableModel {
  const metadata = metadataMap.get(model.id);
  if (!metadata) {
    return model;
  }

  const nextModel: AvailableModel = { ...model };

  if (
    typeof metadata.contextWindow === "number" &&
    metadata.contextWindow > 0
  ) {
    nextModel.context_window = metadata.contextWindow;
  }

  if (metadata.cost) {
    nextModel.cost = metadata.cost;
  }

  return nextModel;
}

async function fetchGatewayModels(): Promise<GatewayModel[]> {
  try {
    const { models } = await gateway.getAvailableModels();
    return models;
  } catch (error) {
    const models = getModelsFromGatewayError(error);
    if (models) {
      return models;
    }

    console.warn("AI Gateway unavailable, falling back to static model list:", (error as Error).message);
    return [];
  }
}

export async function fetchAvailableLanguageModels(): Promise<
  AvailableModel[]
> {
  const models = await fetchGatewayModels();
  return filterDisabledModels(
    models.filter((model) => model.modelType === "language"),
  );
}

const STATIC_MODELS: AvailableModel[] = [
  {
    id: "opencode/big-pickle",
    name: "Big Pickle",
    description: "A free reasoning model from OpenCode Zen with 200k context and tool calling support.",
    modelType: "language",
    context_window: 200_000,
    cost: {
      input: 0,
      output: 0,
      cache_read: 0,
    },
  },
  ...(process.env.ANTHROPIC_API_KEY
    ? [
        {
          id: "anthropic/claude-haiku-4-5",
          name: "Claude Haiku 4.5",
          description: "Anthropic's fastest and most compact model with extended thinking support.",
          modelType: "language",
          context_window: 200_000,
          cost: {
            input: 0.8,
            output: 4,
          },
        } satisfies AvailableModel,
      ]
    : []),
  ...(process.env.OPENAI_API_KEY
    ? [
        {
          id: "openai/gpt-5",
          name: "GPT-5",
          description: "OpenAI's most capable model with advanced reasoning and 1M context window.",
          modelType: "language",
          context_window: 1_000_000,
          cost: {
            input: 10,
            output: 30,
          },
        } satisfies AvailableModel,
      ]
    : []),
];

export async function fetchAvailableLanguageModelsWithContext(): Promise<
  AvailableModel[]
> {
  const [models, modelsDevMetadataMap] = await Promise.all([
    fetchAvailableLanguageModels(),
    fetchModelsDevMetadataMap(),
  ]);

  const gatewayModels = models.map((model) =>
    addModelsDevMetadata(model, modelsDevMetadataMap),
  );

  const gatewayModelIds = new Set(gatewayModels.map((m) => m.id));
  const uniqueStaticModels = STATIC_MODELS.filter(
    (m) => !gatewayModelIds.has(m.id),
  );

  return [...gatewayModels, ...uniqueStaticModels];
}
