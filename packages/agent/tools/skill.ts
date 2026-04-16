import * as path from "path";
import { tool } from "ai";
import { z } from "zod";
import { getSandbox } from "./utils";
import {
  extractSkillBody,
  substituteArguments,
  injectSkillDirectory,
} from "../skills/loader";
import type { SkillMetadata } from "../skills/types";

/**
 * Extended agent context that includes skills.
 */
interface SkillAgentContext {
  skills?: SkillMetadata[];
}

/**
 * Get skills from experimental context.
 */
function getSkills(experimental_context: unknown): SkillMetadata[] {
  const context = experimental_context as SkillAgentContext | undefined;
  return context?.skills ?? [];
}

const skillInputSchema = z.object({
  skill: z.string().describe("The skill name to invoke"),
  args: z.string().optional().describe("Optional arguments for the skill"),
});

export const skillTool = tool({
  description: `Execute a skill to load expert knowledge BEFORE writing code.

Skills contain databases of proven design decisions, correct API patterns, and anti-patterns. You MUST call this tool before writing code in these situations:

MANDATORY skill loading triggers:
- Building/redesigning any UI page or component → call skill("ui-ux-products"), skill("ui-ux-colors"), skill("ui-ux-typography") BEFORE writing code
- Writing GSAP animation code → call skill("gsap-react") BEFORE writing any GSAP code
- Adding scroll animations → call skill("gsap-scrolltrigger") BEFORE writing ScrollTrigger code
- Building a landing page → call skill("ui-ux-landing") BEFORE deciding page structure
- Adding charts → call skill("ui-ux-charts") BEFORE choosing chart type

When users reference "/<something>" (e.g., "/commit"), they are invoking a skill by name.

How to invoke:
- Use this tool with the skill name and optional arguments
- Examples:
  - skill: "gsap-react" - load GSAP React patterns before writing animation code
  - skill: "ui-ux-colors" - load color palettes before choosing colors
  - skill: "commit", args: "-m 'Fix bug'" - invoke with arguments

Important:
- Call this tool BEFORE writing code, not after — the skill data must inform your implementation
- When the user's message starts with "/<name>", call this tool FIRST before any other tool
- NEVER just announce or mention a skill without actually calling this tool
- Only use skills listed in "Available skills" in your system prompt
- If you see a <command-name> tag in the conversation, the skill is ALREADY loaded - follow its instructions directly`,
  inputSchema: skillInputSchema,
  execute: async ({ skill, args }, { experimental_context }) => {
    const sandbox = await getSandbox(experimental_context, "skill");
    const skills = getSkills(experimental_context);

    // Find the skill by name (case-insensitive to match slash command behavior)
    const normalizedSkillName = skill.toLowerCase();
    const foundSkill = skills.find(
      (s) => s.name.toLowerCase() === normalizedSkillName,
    );
    if (!foundSkill) {
      const availableSkills = skills.map((s) => s.name).join(", ");
      return {
        success: false,
        error: `Skill '${skill}' not found. Available skills: ${availableSkills || "none"}`,
      };
    }

    // Check if skill disables model invocation
    if (foundSkill.options.disableModelInvocation) {
      return {
        success: false,
        error: `Skill '${skill}' cannot be invoked by the model (disable-model-invocation is set)`,
      };
    }

    let content: string;

    if (foundSkill.bundledContent) {
      const body = extractSkillBody(foundSkill.bundledContent);
      content = substituteArguments(body, args);
    } else {
      const skillFilePath = path.join(foundSkill.path, foundSkill.filename);
      let fileContent: string;
      try {
        fileContent = await sandbox.readFile(skillFilePath, "utf-8");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          error: `Failed to read skill file: ${message}`,
        };
      }

      const body = extractSkillBody(fileContent);
      const bodyWithDir = injectSkillDirectory(body, foundSkill.path);
      content = substituteArguments(bodyWithDir, args);
    }

    return {
      success: true,
      skillName: skill,
      skillPath: foundSkill.path,
      content,
    };
  },
});

export type SkillToolInput = z.infer<typeof skillInputSchema>;
