import { tool } from "ai";
import { z } from "zod";

export const thinkTool = tool({
  description: `Use this tool to think through complex problems before acting. It logs your reasoning without executing code or making changes.

WHEN TO USE:
- When exploring a repository and discovering the source of a bug, brainstorm several unique ways of fixing it and assess which change(s) are simplest and most effective
- After receiving test results or error output, think through ways to fix failing tests
- When planning a complex refactoring, outline different approaches and their tradeoffs
- When designing a new feature, think through architecture decisions and implementation details
- When debugging a complex issue, organize your thoughts and hypotheses
- When stuck after multiple attempts, reflect on 5-7 different possible sources of the problem and assess likelihood of each
- Before making changes that affect multiple files, think through the dependency chain and order of operations

This tool simply logs your thought process for better transparency and does not execute any code or make changes. Use it freely whenever complex reasoning would help.`,
  inputSchema: z.object({
    thought: z
      .string()
      .describe("Your reasoning, analysis, or brainstorming content."),
  }),
  execute: async ({ thought }) => {
    return {
      success: true,
      thought,
    };
  },
});
