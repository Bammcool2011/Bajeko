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
  });
  ```

## Project-specific conventions (must-follow)

- Use absolute internal paths with the `~` alias for imports. The ESLint rule in `eslint.config.cjs` enforces this. Example:

  ```ts
  import MyComp from '~/components/MyComp.vue';
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
  import MyButton from '~/components/MyButton.vue';
  ```

- Fetching data (SSR-safe):

  ```ts
  const { data } = await useFetch('/api/products');
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

Note: this repository is a Nuxt 4 project. Application code and pages live under the `app/` directory (for example `app/pages/sign-in/index.vue`).

CRITICAL: Before making any code or configuration changes the AGENT must always research relevant best practices first — this includes reviewing official documentation, project guidelines, established standards, and trusted examples. The AGENT should summarize the sources and reasoning in a comment or change note before applying edits.

IMPORTANT: if the AGENT does not fully understand the user's intent or requires additional information to safely make a change, the AGENT MUST PAUSE and ask the user for clarification before proceeding. Do NOT make assumptions or apply changes "by guesswork". When pausing, the AGENT should:

- state what is unclear (specific questions or missing data)
- list the possible safe options (if any) and the recommended default (if the user prefers a default)
- wait for an explicit reply from the user before editing files or opening PRs

(This rule is critical: avoid editing code, configuration, or documentation when requirements are ambiguous.)

1. Always read `package.json` before making changes.
   - It is the authoritative source for which modules and versions the project uses; use it to decide which docs to fetch and which APIs are available.
   - Example (pseudocode):
     ```json
     { "action": "read_file", "path": "package.json" }
     ```

2. Prefer project MCP tools (when present) for library metadata:
   - For library documentation: call `mcp_context7_get-library-docs` with the library id (example: `/nuxt/nuxt`).
     ```json
     { "tool": "mcp_context7_get-library-docs", "library_id": "/nuxt/nuxt" }
     ```
   - For `@nuxt/ui` components: call `mcp_nuxt-ui_get_component` with component name:
     ```json
     { "tool": "mcp_nuxt-ui_get_component", "component_name": "Button" }
     ```
   - Search for an MCP server in the repo (look for `server/`, `server/api/`, or `mcp/`) and query it for project-specific context. If MCP isn't available, fall back to official docs (e.g., https://nuxt.com/docs, https://ui.nuxtjs.org).

3. Local checks required before opening a PR or committing:
   - Run `npm run lint`
   - Run `npm run typecheck`
   - If changes affect build output, run `npm run build`
   - Include a short CI checklist in the PR body indicating which checks were run and their results.

4. Branch & PR policy (required)
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

5. Agent commit rules
   - Do not change repository-level protections, secrets, or workflow permissions without explicit human approval.
   - If changes touch security-sensitive files (CI/workflows, Dockerfiles, env handling), request a human reviewer and do not merge automatically.

6. Fallbacks & documentation
   - If MCP tools are unavailable, prefer official upstream docs (Nuxt, Nuxt UI).
   - If the agent lacks permissions for any required GitHub API action, post a clear top-level comment on the PR indicating the required maintainer actions.

## When performing a code review (for GitHub Copilot)

The repository supports GitHub Copilot Code Review agents. Put short, directive lines in this file to tell Copilot how to behave when it runs a review from IDEs or the web UI. Keep each instruction concise—Copilot reads these lines literally.

Recommended Copilot instructions (add or edit these lines as needed):

- When performing a code review, respond in English.
- When performing a code review, focus on readability, maintainability, and adherence to project conventions (use `~` alias for imports, avoid direct `fetch()` in SSR code).
- When performing a code review, avoid suggesting changes that access `window`, `document`, `localStorage`, or `sessionStorage` during server render; suggest `onMounted` or `process.client` instead.
- When performing a code review, produce a concise JSON summary with these fields only:
  - `code_quality`: integer 0-100
  - `performance`: integer 0-100
  - `security`: integer 0-100
  - `nuxt_ssr`: integer 0-100
  - `suggestions`: array of short actionable suggestions (strings)
  - `commentary`: short single-line summary (string)
- When performing a code review, return JSON only; if you must include explanation, append it after the JSON separated by a line with three dashes (`---`).
- When performing a code review, if any category is below 70, suggest prefixing the PR title with "[❌ NEED FIX]"; otherwise suggest "[✅ PASSED]".
- When performing a code review, only analyze files with these extensions: `.vue`, `.ts`, `.js`, `.scss`, `.json`; ignore binaries and large media files.
- When performing a code review, truncate long diffs (e.g. > 3000 characters per file) and analyze the most relevant changes; indicate when a patch was truncated.

Notes for maintainers and reviewers:

- Copilot reads this file for short, repository-level instructions that guide automated code reviews in VS Code, Visual Studio, and the web UI. Keep instructions simple and test changes locally in the IDE before relying on them in CI.
- If you also want a human-review rubric, see the lower sections of this file (human-facing reviewer guidance and scoring rubric).
