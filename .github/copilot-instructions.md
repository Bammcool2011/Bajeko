<!-- .github/copilot-instructions.md - Guidance for AI coding agents working on Bajeko -->

# Quick orientation

This is a Nuxt 4 (Nuxt v4) + TypeScript minimal app (see `nuxt.config.ts`). Key entry points: the `app/` directory (application layout and pages), `package.json` scripts (dev/build/preview/typecheck), and `eslint.config.cjs` which encodes important project conventions. Keep the guidance below focused on discoverable, actionable patterns used in this repo.

## Quick start (commands)

Use the npm scripts defined in `package.json` (works the same from PowerShell on Windows):

- Install: `npm install` (or `pnpm install` / `yarn install`)
- Dev server: `npm run dev` (local: http://localhost:3000)
- Build: `npm run build`
- Preview a production build: `npm run preview`
- Typecheck: `npm run typecheck` (runs `tsc --noEmit`)
- Lint: `npm run lint` (runs ESLint using the project config)

Note: `postinstall` runs `nuxt prepare` to ensure Nuxt modules are ready after install — don’t remove it.

## Architecture & patterns (what to know)

- Nuxt 4 (Nitro) app using the `/app` directory structure. Pages are under `app/pages/` (example: `app/pages/sign-in/index.vue`).
- Modules in `nuxt.config.ts`: `@nuxt/image`, `@nuxt/eslint`, `@nuxt/ui`. `@nuxt/ui` provides globally available UI components (they may be used without explicit imports).
- TypeScript + Vue Single File Components. `vue-tsc` / `tsc` are present for type checking.
- Auto-imports are disabled in this project — prefer explicit imports for composables and components (see ESLint rules).

    NOTE: Nuxt auto-imports are intentionally disabled in this repository. To ensure this is explicit in `nuxt.config.ts`, prefer the typed form which is compatible with the project's TypeScript config. Example:

    ```ts
    // nuxt.config.ts
    export default defineNuxtConfig({
        // ...other options
        // disable automatic composable/component imports
        imports: { autoImport: false },
    })
    ```

## Project-specific conventions (must-follow)

- Use absolute internal paths with the `~` alias for imports. The ESLint rule in `eslint.config.cjs` enforces this. Example:

    ```ts
    import MyComp from "~/components/MyComp.vue"
    ```

- Avoid calling the browser global `fetch()` directly. The linter gives a clear message: use `useFetch()` or `$fetch()` instead so code stays SSR-compatible and avoids hydration mismatches.

- Don’t access `document`, `window`, `localStorage`, or `sessionStorage` during SSR. Use `onMounted()` or `process.client` checks (these restrictions are enforced by `no-restricted-syntax` rules in `eslint.config.cjs`).

- Console usage: `console` is warned about in linting; prefer using structured logging or remove debug logs before committing.

- TypeScript rule: unused variables must be prefixed with `_` to ignore them (see `@typescript-eslint/no-unused-vars` config).

## Linting and formatting

- ESLint configuration is centralized in `eslint.config.cjs`. It includes Prettier integration and specific rules for Nuxt/Vue usage. Respect these rules when changing files.

## Integration points & external dependencies

- No server API routes are present in the repo root (this is primarily a frontend Nuxt app). If adding server logic, follow Nitro conventions (`server/` or `server/api/`).

- Primary module configuration lives in `nuxt.config.ts` (this repo currently lists `@nuxt/image`, `@nuxt/eslint`, `@nuxt/ui`). Update modules there and run `npm run dev` or `npm run build` to validate changes.

## Examples of common edits

- Add a page: create `app/pages/<name>/index.vue` (follow `vue/block-order` enforced by ESLint: template → script → style).
- Add a component and import it with `~` alias:

    ```ts
    // src: components/MyButton.vue
    import MyButton from "~/components/MyButton.vue"
    ```

- Fetching data (SSR-safe):

    ```ts
    const { data } = await useFetch('/api/products')
    ```

## Files to inspect when unsure

- `nuxt.config.ts` — module/config entrypoints
- `package.json` — scripts for local workflows
- `eslint.config.cjs` — project-specific linting rules and restrictions (most critical guidance lives here)
- `app/` — layout and pages (example: `app/pages/sign-in/index.vue`)

If anything here is unclear or there are additional local conventions you want captured (build variants, CI steps, environment variables, or preferred test commands), tell me and I will iterate the file.

## Nuxt configuration notes (from docs)

- `nuxt.config.ts` uses `defineNuxtConfig` (typed config). This repo sets `compatibilityDate` — preserve it when adjusting framework-related behavior.
- Runtime configuration: prefer `runtimeConfig` for server-only secrets and `runtimeConfig.public` for client-visible values. Environment variables can be provided via a `.env` file using `NUXT_` prefixes (e.g. `NUXT_PUBLIC_API_BASE`).
- `defineAppConfig` / `app.config.ts` can be used for app-level reactive configuration; access via `useAppConfig()` and change at runtime with `updateAppConfig()`.
- Nitro configuration (the `nitro` key) controls server engine behavior and route rules (`/server` or `server/api` are the places to add server endpoints if needed).
- Default Nuxt aliases include `~` and `@` for the source dir. This project enforces `~` via ESLint but those aliases exist by default.
- Modules should be declared in `nuxt.config.ts` (this repo uses `@nuxt/image`, `@nuxt/eslint`, `@nuxt/ui`). For monorepos, `modulesDir` can be customized.

---

## Agent guidance — required workflow

These rules describe the minimal, required workflow any automated agent (Copilot / AGENT) must follow before proposing or committing changes. The goal is deterministic, auditable behavior.

IMPORTANT: if the AGENT does not fully understand the user's intent or requires additional information to safely make a change, the AGENT MUST PAUSE and ask the user for clarification before proceeding. Do NOT make assumptions or apply changes "by guesswork". When pausing, the AGENT should:

- state what is unclear (specific questions or missing data)
- list the possible safe options (if any) and the recommended default (if the user prefers a default)
- wait for an explicit reply from the user before editing files or opening PRs

(This rule is critical: avoid editing code, configuration, or documentation when requirements are ambiguous.)

1) Always read `package.json` before making changes.
   - It is the authoritative source for which modules and versions the project uses; use it to decide which docs to fetch and which APIs are available.
   - Example (pseudocode):
     ```json
     { "action": "read_file", "path": "package.json" }
     ```

2) Prefer project MCP tools (when present) for library metadata:
   - For library documentation: call `mcp_context7_get-library-docs` with the library id (example: `/nuxt/nuxt`).
     ```json
     { "tool": "mcp_context7_get-library-docs", "library_id": "/nuxt/nuxt" }
     ```
   - For `@nuxt/ui` components: call `mcp_nuxt-ui_get_component` with component name:
     ```json
     { "tool": "mcp_nuxt-ui_get_component", "component_name": "Button" }
     ```
   - Search for an MCP server in the repo (look for `server/`, `server/api/`, or `mcp/`) and query it for project-specific context. If MCP isn't available, fall back to official docs (e.g., https://nuxt.com/docs, https://ui.nuxtjs.org).

3) Local checks required before opening a PR or committing:
   - Run `npm run lint`
   - Run `npm run typecheck`
   - If changes affect build output, run `npm run build`
   - Include a short CI checklist in the PR body indicating which checks were run and their results.

4) Branch & PR policy (required)
   - Never push changes directly to main. Always create a branch:
     - `feature/<short-desc>` for new features
     - `fix/<short-desc>` for bug fixes
     - `chore/<short-desc>` for non-functional changes
   - PR body must include:
     - Summary of change
     - How to test locally (commands)
     - CI checks expected and results
     - Screenshots or recordings if UI changes
   - Assign at least one human reviewer (preferably a maintainer) and add labels if applicable.

5) Agent commit rules
   - Do not change repository-level protections, secrets, or workflow permissions without explicit human approval.
   - If changes touch security-sensitive files (CI/workflows, Dockerfiles, env handling), request a human reviewer and do not merge automatically.

6) Fallbacks & documentation
   - If MCP tools are unavailable, prefer official upstream docs (Nuxt, Nuxt UI).
   - If the agent lacks permissions for any required GitHub API action, post a clear top-level comment on the PR indicating the required maintainer actions.

---

## Code review guidance for agents (GitHub PR comments)

When acting as an automated reviewer for GitHub pull requests, the agent MUST post its results as GitHub PR comments. Follow these rules to produce concise, actionable comments:

1) Top-level PR review comment (required)
   - Post one consolidated top-level comment on the PR with:
     - A short human-readable summary (one or two lines).
     - A machine-readable JSON block (code block) that CI or other tools can parse.
   - The machine-readable JSON MUST use this structure exactly:
     ```json
     {
       "summary_prefix": "<✅ PASS|❌ NEED FIX>",
       "scores": {
         "code_quality": <int 0-100>,
         "performance": <int 0-100>,
         "security": <int 0-100>,
         "ssr": <int 0-100>
       },
       "fixes": [
         {
           "path": "<path/to/file>",
           "lines": "<start>-<end>",
           "suggestion": "<minimal suggested change or snippet>"
         }
       ]
     }
     ```
   - Example top-level comment content (human + JSON):
     ```
     Summary: `[❌ NEED FIX]` — Code Quality 62 🟡, Performance 55 🟡, Security 90 🟢, SSR 45 🟡

     ```json
     {
       "summary_prefix":"❌ NEED FIX",
       "scores":{"code_quality":62,"performance":55,"security":90,"ssr":45},
       "fixes":[{"path":"app/pages/sign-in/index.vue","lines":"3-7","suggestion":"Wrap access in onMounted(...)"}]
     }
     ```
     ```

2) Inline review comments (recommended for specific changes)
   - For each suggested fix, leave an inline review comment at the relevant file and line range when possible.
   - Keep each inline comment short (1–3 lines): what to change + one-sentence rationale.
   - Do NOT paste entire files in comments. Provide minimal diffs/snippets only.

3) Prioritization & scoring
   - Use integer scores (0–100) for four categories: Code Quality, Performance, Security, SSR.
   - Use emoji ranges to help humans scan results:
     - 🔴 0–39: critical problems
     - 🟡 40–69: needs improvement
     - 🟢 70–100: acceptable / good
   - If ALL four category scores are >= 70 (and none is in 🔴 range), the summary_prefix is "✅ PASS"; otherwise "❌ NEED FIX".

4) Output style & automation
   - The top-level comment is the canonical machine-readable artifact. If CI or bots ingest review results, they should parse the JSON block.
   - Additionally, provide a concise human-readable list of top 3 fixes in the top-level comment (one line each) for quick scanning.
   - Keep comments actionable and prioritized by severity.

5) Example final review (human + inline)
   - Human-readable summary example:
     - Summary: `[❌ NEED FIX]` — Code Quality 62 🟡, Performance 55 🟡, Security 90 🟢, SSR 45 🟡
     - Fixes:
         1. Location: `app/pages/sign-in/index.vue` (lines 3–7)
            Issue: Missing onMounted() guard around `localStorage` access.
            Suggestion: Wrap access in `onMounted(() => { /* use localStorage here */ })`.
   - Machine-readable JSON (exact format for the top-level comment):
     ```json
     {
       "summary_prefix": "❌ NEED FIX",
       "scores": {"code_quality":62,"performance":55,"security":90,"ssr":45},
       "fixes": [{"path":"app/pages/sign-in/index.vue","lines":"3-7","suggestion":"Wrap access in onMounted(...)"}]
     }
     ```

This approach keeps reviews fast to scan, actionable for engineers, and suitable for automated PR comments, status checks, or CI integrations.

---

## PR title and merge blocking policy (for automated reviewers)

When the agent reviews a PR it must update the PR title and take non-destructive blocking actions according to the review outcome. Follow these exact rules.

Decision rule for title prefix
- Compute the four category scores (Code Quality, Performance, Security, SSR) each as an integer 0–100.
- If ALL four scores are >= 70 and none is in the 🔴 range (0–39), the review result is PASS. Prefix the PR title with:
  - [✅ PASS] <original title>
- Otherwise the review result is NEED FIX. Prefix the PR title with:
  - [❌ NEED FIX] <original title>

Required actions when NEED FIX
1. Update the PR title to add the prefix "[❌ NEED FIX] " (preserve the rest of the title text).
   - API: PATCH /repos/{owner}/{repo}/pulls/{pull_number}
   - Body example:
     ```json
     { "title": "[❌ NEED FIX] " + current_title }
     ```
2. Convert the PR to draft to prevent accidental merging until the author reworks the change.
   - API: PATCH /repos/{owner}/{repo}/pulls/{pull_number}
   - Body example (set draft):
     ```json
     { "draft": true }
     ```
   - Note: If the agent lacks permission to convert to draft, add the "do not merge / needs-fix" label and post a top-level comment instructing maintainers to hold merge.
3. Add a label "needs-fix" (or "do not merge") to the PR.
   - API: POST /repos/{owner}/{repo}/issues/{issue_number}/labels
   - Body example:
     ```json
     ["needs-fix"]
     ```
4. Post the top-level review comment (required — see Code review guidance) containing both human-readable summary and the exact machine-readable JSON block. The top-level comment must also include an explicit "Do not merge" sentence when NEED FIX.
   - Example human sentence: "This PR requires fixes before merge — converted to draft and labeled needs-fix. Do not merge until author marks Ready for review or pushes new commits."
5. Do NOT merge the PR or approve it. If the agent previously approved, dismiss any approvals if possible (use the Reviews API to submit a "REQUEST_CHANGES" review), or explicitly post a "request changes" review via the Reviews API.

When PASS
- Update the PR title to prefix "[✅ PASS] " (replace any previous prefix).
- If the PR is currently a draft and the author has not explicitly marked it Ready for review, do NOT convert to ready_for_review without human consent. Instead, post a top-level comment noting the PR passed automated review and request the author to mark the PR ready for final review.
- Remove the "needs-fix" label if present.

Re-evaluation after new commits or author action
- The agent must watch the PR's head SHA. When the PR head changes (new commit) or the author marks the draft as ready_for_review, the agent must re-run the full review sequence (lint/typecheck/build + scoring).
- After re-evaluation:
  - If PASS, update title to "[✅ PASS] ..." and remove "needs-fix" label.
  - If still NEED FIX, keep or reapply "[❌ NEED FIX] ..." and remain draft (or keep the "needs-fix" label). Post a new top-level comment with the updated JSON.

Permissions & safety notes
- If the agent cannot convert the PR to draft or add labels due to insufficient permissions, it must:
  1. Post the top-level comment with human summary + JSON.
  2. Add explicit instructions for maintainers in the comment, e.g. "Maintainer action required: convert PR to draft and add 'needs-fix' label to block merge."
- The agent must never change repository-level protections, secrets, or workflow permissions. Those actions require explicit human approval.

Minimal pseudocode for failing-review path
```text
1. compute_scores()
2. if not pass:
     - new_title = "[❌ NEED FIX] " + original_title (if not already prefixed)
     - PATCH /repos/{owner}/{repo}/pulls/{num} { title: new_title, draft: true }
     - POST /repos/{owner}/{repo}/issues/{num}/labels ["needs-fix"]
     - POST comment with human summary + JSON + "Do not merge" instruction
     - SUBMIT a "REQUEST_CHANGES" review (if appropriate)
3. watch PR head for changes; on change, re-run from step 1.
```

Examples
- Top-level comment snippet (human + JSON):
  ```
  Summary: `[❌ NEED FIX]` — Code Quality 62 🟡, Performance 55 🟡, Security 90 🟢, SSR 45 🟡

  ```json
  {
    "summary_prefix":"❌ NEED FIX",
    "scores":{"code_quality":62,"performance":55,"security":90,"ssr":45},
    "fixes":[{"path":"app/pages/sign-in/index.vue","lines":"3-7","suggestion":"Wrap access in onMounted(...)"}]
  }
  ```
  ```

- If converting to draft is not possible: add the same comment and add the label "needs-fix", then ping maintainers to convert to draft.

Interaction rules
- The agent must not convert a draft PR back to ready_for_review itself. The PR author must mark Ready for review, or a human maintainer must approve that action.
- The agent should re-evaluate automatically when the PR head SHA changes or when a maintainer/author marks the PR ready.

This policy ensures failing PRs are explicitly labeled, visibly blocked, and remain unmergeable until the author provides updated commits or explicitly requests re-review.