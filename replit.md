# Open Harness — Replit Migration Notes

## Overview
Open Harness (formerly Open Agents) is a Next.js 16 Bun monorepo that provides an AI coding-agent interface. It has been migrated from Vercel hosting to Replit, using Neon PostgreSQL, Upstash Redis, and the Vercel Sandbox API for coding-agent execution.

## Workflow
- **Start command**: `bash -c 'cd apps/web && bun run dev'` on port 5000
- **Package manager**: Bun (bun@1.2.14)

## Required Secrets
| Secret | Purpose |
|--------|---------|
| `POSTGRES_URL` | Neon PostgreSQL connection string |
| `REDIS_URL` | Upstash Redis connection string |
| `ENCRYPTION_KEY` | AES-256 encryption for sensitive data |
| `JWE_SECRET` | 32-byte base64url key for guest JWE sessions (A256GCM) |
| `VERCEL_ACCESS_TOKEN` | Vercel API token for sandbox creation |
| `VERCEL_PROJECT_ID` | Vercel project for sandbox association |
| `VERCEL_TEAM_ID` | Vercel team for sandbox creation |
| `OPENCODE_API_KEY` | OpenCode Zen API key (starts with `sk-`) for Big Pickle model |

## Optional Secrets
| Secret | Purpose |
|--------|---------|
| `VERCEL_SANDBOX_BASE_SNAPSHOT_ID` | Pre-built snapshot with bun/jq/chromium (empty = clean Ubuntu) |
| `GITHUB_APP_ID` | GitHub App for repo linking/PR features |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key |
| `NEXT_PUBLIC_GITHUB_APP_SLUG` | GitHub App slug for OAuth link |

## Key Migration Changes

### 1. Auto-Guest Sessions (`apps/web/proxy.ts`)
- Changed `export default async function proxy()` (Next.js 16 pattern)
- Auto-creates JWE guest sessions when no session cookie exists
- No sign-in required — users get a `guest-XXXXXXXX` identity automatically

### 2. Big Pickle Default Model (`apps/web/lib/models-with-context.ts`, `apps/web/lib/models.ts`)
- `opencode/big-pickle` added as static model (free on OpenCode Zen)
- Routes via `@ai-sdk/openai` pointing to `https://opencode.ai/zen/v1`
- Requires `OPENCODE_API_KEY` environment secret (key starts with `sk-`)
- Both `DEFAULT_MODEL_ID` and `APP_DEFAULT_MODEL_ID` set to `opencode/big-pickle`
- Vercel AI Gateway failures caught gracefully (returns empty array, falls back to static models)

### 3. BotID Removed from API Routes
- Removed `checkBotId()` calls from: sandbox, chat, generate-pr, generate-title, generate-commit-message, transcribe routes
- These were returning 403 on Replit; auth session check is the only guard now

### 4. Sandbox Timeout Fixed (`apps/web/lib/sandbox/config.ts`, `packages/sandbox/vercel/sandbox.ts`)
- Vercel Sandbox API caps `timeout` at 2,700,000 ms (45 minutes)
- `MAX_SDK_TIMEOUT_MS` updated from 18,000,000 to 2,700,000
- `DEFAULT_SANDBOX_TIMEOUT_MS` set to `2,670,000` ms (accounts for 30s `beforeStop` buffer)

### 5. Sandbox Base Snapshot Removed
- Hardcoded snapshot `snap_EjsphVxi07bFKrfojljJdIS41KHT` replaced with optional env var
- `DEFAULT_SANDBOX_BASE_SNAPSHOT_ID = process.env.VERCEL_SANDBOX_BASE_SNAPSHOT_ID || undefined`
- Without a snapshot, sandboxes start from a clean Ubuntu environment
- Set `VERCEL_SANDBOX_BASE_SNAPSHOT_ID` to a valid snapshot ID to restore pre-installed tools

### 6. Mark-as-Read Graceful Handling (`apps/web/hooks/use-session-chats.ts`)
- The `/read` API route (`POST /api/sessions/[sessionId]/chats/[chatId]/read`) is compiled lazily by Turbopack in dev mode
- On the very first request after a server restart, Turbopack may not have compiled the route yet and returns HTML 404
- Fixed `markChatRead` to check `Content-Type` before calling `.json()` — silently skips non-JSON responses instead of throwing a `SyntaxError` console error
- In production (pre-compiled) this path never triggers

### 7. Button Nesting Fixed (`apps/web/components/inbox-sidebar.tsx`)
- `SessionRow` outer `<button>` changed to `<div role="button" tabIndex={0}>` to fix nested button HTML violation

### 8. Anthropic & OpenAI Direct Model Support (`packages/agent/models.ts`, `apps/web/lib/models-with-context.ts`)
- Added direct routing for `anthropic/*` models when `ANTHROPIC_API_KEY` is set — bypasses Vercel AI Gateway
- Added direct routing for `openai/*` models when `OPENAI_API_KEY` is set — bypasses Vercel AI Gateway
- **Claude Haiku 4.5** (`anthropic/claude-haiku-4-5`) appears in model picker when `ANTHROPIC_API_KEY` is present
- **GPT-5** (`openai/gpt-5`) appears in model picker when `OPENAI_API_KEY` is present
- Both models are omitted from the static model list if the corresponding key is missing — no errors, no empty entries
- GPT-5 uses the OpenAI Responses API (`openaiProvider.responses(...)`) with `store: false` and encrypted reasoning content options
- Claude Haiku 4.5 uses the extended thinking API with an 8000-token budget

### 9. Agent Tech Stack & UI Quality (`packages/agent/system-prompt.ts`)
- Full rewrite of the **Tech Stack for Web Projects** section with production-quality UI standards
- Core stack: TypeScript + React + Tailwind CSS + Next.js (App Router)
- **Component libraries**: Shadcn/ui (primary, via `npx shadcn@latest init/add`), HeroUI v3, Radix UI primitives
- **Icons**: lucide-react (primary), react-icons; never emoji or text substitutes
- **Animations**: framer-motion (primary), tailwindcss-animate; all interactions must be animated
- **Images**: Unsplash URLs or picsum.photos for placeholders; next/image in Next.js projects
- **3D/Visual**: @react-three/fiber + @react-three/drei for 3D scenes; @splinetool/react-spline for Spline embeds
- **Package installation**: agent must run `bun add` (or npm/pnpm based on lock file) before using any package
- **Design quality standards**: visual hierarchy, spacing, color palette, typography, responsiveness, dark mode — bare unstyled pages are explicitly prohibited

### 10. World-Class Design Intelligence (`packages/agent/system-prompt.ts`)
- Added a comprehensive **10-Law design system** to the agent's system prompt covering every dimension of design quality
- **LAW 1 — Information Architecture**: Agent MUST plan sitemap and page purposes before writing code. Anti-cramming rule: one page = one conversion goal. Structured page templates for SaaS, B2C, Enterprise, and marketing landing pages
- **LAW 2 — Design Point of View**: Agent answers brand personality questions (playful vs serious, technical vs consumer, etc.) before choosing a design archetype
- **LAW 3 — 7 Design Reference Systems**: Ultra-Minimal/Precise (Linear, Vercel, Raycast), Motion-First/Editorial (Framer, Webflow), Human/Warm (Airbnb, Notion), Technical/Developer (Stripe, Supabase), Premium/Luxury (Apple, BMW, Ferrari), Playful/Consumer (Spotify, Figma), Trust-Signal/Enterprise (IBM, Coinbase) — each with specific color, type, spacing, layout, motion, and image rules
- **LAW 4 — Section Composition**: Hero, feature grid, testimonials, stats, CTA, footer — each has explicit rules on what to include and exclude
- **LAW 5 — Typography System**: Full scale from Display (72-120px) down to Caption (12-13px) with Tailwind class equivalents
- **LAW 6 — Color System**: Exactly 9 color roles (background, surface, border, primary text, secondary text, accent, accent-hover, destructive, success)
- **LAW 7 — Spacing System**: Section, container, card, grid, stack, and max-width rules using Tailwind scale
- **LAW 8 — Motion Design**: Timing values, Framer Motion patterns, and which animations earn their place vs which distract
- **LAW 9 — Anti-Pattern Blacklist**: 10 explicitly forbidden patterns (laptop mockups, lorem ipsum, rainbow gradient buttons, empty placeholder grids, wall of text, etc.)
- **LAW 10 — Pre-Delivery Checklist**: 14-point quality gate agent must pass before calling a design complete
- Source: 59 world-class brand design systems from https://github.com/VoltAgent/awesome-design-md

### 11. Voyage AI Embedding Tool (`packages/agent/tools/embed.ts`)
- New "embed" tool registered in the agent's toolset alongside read/write/bash/etc.
- Uses Voyage AI API (`voyage-3.5` or `voyage-3.5-lite`) — requires `VOYAGE_API_KEY` secret
- Called server-side (Next.js process) — API key never exposed to the Vercel sandbox
- Capabilities: generate embedding vectors, cosine similarity comparison, semantic ranking via `compareAgainst` parameter
- Agent is instructed in the system prompt to use it for: semantic code search, finding related files, duplicate detection, and helping users build semantic search / RAG features into their apps
- Tailwind v4 note added to system prompt: `tailwind.config.ts` does not exist in Next.js 16 projects — config lives in `globals.css` under `@theme`

### 11. Big Pickle Empty-Response Handling (`packages/agent/models.ts`, `apps/web/app/workflows/chat.ts`)
- **Root cause**: MiniMax M2.5 (Big Pickle) returns `finishReason: "other"` with `outputTokens: 0` when given a large multi-turn tool context (9000+ tokens, 11 tools) after tool execution — the second LLM call within a step (tool results → final response) silently produces nothing
- **Fix A** (`models.ts`): Wrapped `opencodeProvider.chat(modelName)` with `wrapLanguageModel` + `defaultSettingsMiddleware({ settings: { maxTokens: 16384 } })` — forces the model to know it must generate up to 16 K tokens, preventing silent empty returns
- **Fix B** (`chat.ts` `runAgentStep`): When `finishReason === "other"` AND `stepUsage.outputTokens === 0`, writes an `{ type: "error", errorText: "..." }` chunk to the UI stream so the user sees a clear error message instead of an empty chat bubble (which caused "Worker error: {} {}" in the browser)
- **Stale stream note**: When the server is restarted mid-workflow, the chat may show "Thinking..." indefinitely. The `reconcileExistingActiveStream` function (in `apps/web/app/api/chat/route.ts`) auto-clears stale stream IDs from Redis/DB when a new message is sent to the same chat — no code change required; just send a follow-up message to unstick it

### 12. Coding Agent Intelligence Upgrade (`packages/agent/system-prompt.ts`, `packages/agent/tools/think.ts`)
- **ThinkTool** (inspired by OpenHands): New `think` tool registered in agent toolset — lets the agent brainstorm, reason through problems, and organize hypotheses without executing code. Used for complex debugging, architecture decisions, and multi-approach analysis.
- **Problem-Solving Workflow** (OpenHands): Structured 5-step approach: EXPLORATION → ANALYSIS → TESTING → IMPLEMENTATION → VERIFICATION
- **Troubleshooting Protocol** (OpenHands): When stuck after repeated attempts, agent reflects on 5-7 possible causes, assesses likelihood, and methodically addresses the most likely ones
- **Efficiency Section** (OpenHands/OpenCode): Agent instructed to combine bash commands, batch independent tool calls, and early-stop exploration once enough context is gathered
- **File System Guidelines** (OpenHands): Never create versioned duplicates (file_fix.py, file_v2.py), always modify originals, clean up temp files
- **Process Management** (OpenHands): Never use `pkill -f keyword` — always find specific PID first
- **Code Quality** (OpenHands): Minimal comments, understand before changing, split large functions, imports at top
- **Technical Philosophy** (OpenHands/Torvalds): Good taste (eliminate edge cases > add conditionals), pragmatism (solve real problems), simplicity (three levels of indentation max), never break what works, data structures first
- Sources: OpenHands CodeAct agent, OpenCode (anomalyco), Goose (AAIF), vercel-labs/open-agents

## Architecture
- **Frontend**: Next.js 16 App Router, React, Tailwind CSS
- **Backend**: Next.js API routes + Vercel Workflows
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Cache/Pub-Sub**: Redis (Upstash)
- **Sandboxes**: Vercel Sandbox API (isolated Ubuntu containers for agent code execution)
- **AI Models**: Static list (Big Pickle via zenmux.ai) + optional Vercel AI Gateway models
