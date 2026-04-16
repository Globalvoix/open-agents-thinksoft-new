import { discoverSkills, allBundledSkills } from "@open-harness/agent";
import { connectSandbox } from "@open-harness/sandbox";
import { getUserGitHubToken } from "@/lib/github/user-token";
import { DEFAULT_SANDBOX_PORTS } from "@/lib/sandbox/config";
import {
  getVercelCliSandboxSetup,
  syncVercelCliAuthToSandbox,
} from "@/lib/sandbox/vercel-cli-auth";
import { getSandboxSkillDirectories } from "@/lib/skills/directories";
import { getCachedSkills, setCachedSkills } from "@/lib/skills-cache";
import type { SessionRecord } from "./chat-context";

type DiscoveredSkills = Awaited<ReturnType<typeof discoverSkills>>;
type ConnectedSandbox = Awaited<ReturnType<typeof connectSandbox>>;
type ActiveSandboxState = NonNullable<SessionRecord["sandboxState"]>;

function mergeWithBundledSkills(skills: DiscoveredSkills): DiscoveredSkills {
  const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));
  return [
    ...skills,
    ...allBundledSkills.filter(
      (s) => !existingNames.has(s.name.toLowerCase()),
    ),
  ];
}

async function loadSessionSkills(
  sessionId: string,
  sandboxState: ActiveSandboxState,
  sandbox: ConnectedSandbox,
): Promise<DiscoveredSkills> {
  const cachedSkills = await getCachedSkills(sessionId, sandboxState);
  if (cachedSkills !== null) {
    return mergeWithBundledSkills(cachedSkills);
  }

  const skillDirs = await getSandboxSkillDirectories(sandbox);

  const discoveredSkills = await discoverSkills(sandbox, skillDirs);
  const merged = mergeWithBundledSkills(discoveredSkills);
  await setCachedSkills(sessionId, sandboxState, merged);
  return merged;
}

export async function createChatRuntime(params: {
  userId: string;
  sessionId: string;
  sessionRecord: SessionRecord;
}): Promise<{
  sandbox: ConnectedSandbox;
  skills: DiscoveredSkills;
}> {
  const { userId, sessionId, sessionRecord } = params;

  const sandboxState = sessionRecord.sandboxState;
  if (!sandboxState) {
    throw new Error("Sandbox state is required to create chat runtime");
  }

  const [githubToken, vercelCliSetup] = await Promise.all([
    getUserGitHubToken(userId),
    getVercelCliSandboxSetup({ userId, sessionRecord }).catch((error) => {
      console.warn(
        `Failed to prepare Vercel CLI setup for session ${sessionId}:`,
        error,
      );
      return null;
    }),
  ]);

  const sandbox = await connectSandbox(sandboxState, {
    githubToken: githubToken ?? undefined,
    ports: DEFAULT_SANDBOX_PORTS,
  });

  if (vercelCliSetup) {
    try {
      await syncVercelCliAuthToSandbox({ sandbox, setup: vercelCliSetup });
    } catch (error) {
      console.warn(
        `Failed to sync Vercel CLI auth for session ${sessionId}:`,
        error,
      );
    }
  }

  const skills = await loadSessionSkills(sessionId, sandboxState, sandbox);

  return {
    sandbox,
    skills,
  };
}
