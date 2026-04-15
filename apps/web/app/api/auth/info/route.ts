import type { NextRequest } from "next/server";
import { getGitHubAccount } from "@/lib/db/accounts";
import { getInstallationsByUserId } from "@/lib/db/installations";
import { ensureGuestUser, userExists } from "@/lib/db/users";
import { getSessionFromReq } from "@/lib/session/server";
import type { SessionUserInfo } from "@/lib/session/types";

const UNAUTHENTICATED: SessionUserInfo = { user: undefined };

export async function GET(req: NextRequest) {
  const session = await getSessionFromReq(req);

  if (!session?.user?.id) {
    return Response.json(UNAUTHENTICATED);
  }

  // Run the user-existence check in parallel with the GitHub queries
  // so there is zero added latency on the happy path.
  const [exists, ghAccount, installations] = await Promise.all([
    userExists(session.user.id),
    getGitHubAccount(session.user.id),
    getInstallationsByUserId(session.user.id),
  ]);

  // Auto-create guest user in the DB on first request if they don't exist yet.
  // The session cookie is created by middleware before a DB entry exists.
  if (!exists) {
    await ensureGuestUser({
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatar,
    });
  }

  const hasGitHubAccount = ghAccount !== null;
  const hasGitHubInstallations = installations.length > 0;
  const hasGitHub = hasGitHubAccount || hasGitHubInstallations;

  const data: SessionUserInfo = {
    user: session.user,
    authProvider: session.authProvider,
    hasGitHub,
    hasGitHubAccount,
    hasGitHubInstallations,
  };

  return Response.json(data);
}
