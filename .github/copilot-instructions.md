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

    import MyComp from "~/components/MyComp.vue"

- Avoid calling the browser global `fetch()` directly. The linter gives a clear message: use `useFetch()` or `$fetch()` instead so code stays SSR-compatible and avoids hydration mismatches.

- Don’t access `document`, `window`, `localStorage`, or `sessionStorage` during SSR. Use `onMounted()` or `process.client` checks (these restrictions are enforced by `no-restricted-syntax` rules in `eslint.config.cjs`).

- Console usage: `console` is warned about in linting; prefer using structured logging or remove debug logs before committing.

- TypeScript rule: unused variables must be prefixed with `_` to ignore them (see `@typescript-eslint/no-unused-vars` config).

## Linting and formatting

- ESLint configuration is centralized in `eslint.config.cjs`. It includes Prettier integration and specific rules for Nuxt/Vue usage. Respect these rules when changing files.

## Integration points & external dependencies

- No server API routes are present in the repo root (this is primarily a frontend Nuxt app). If adding server logic, follow Nitro conventions (`server/` or `server/api/`).

- Primary module configuration lives in `nuxt.config.ts` (this repo currently lists `@nuxt/image`, `@nuxt/eslint`, `@nuxt/ui`). Update modules there and run `npm run dev` or `npm run build` to validate.

## Examples of common edits

- Add a page: create `app/pages/<name>/index.vue` (follow `vue/block-order` enforced by ESLint: template → script → style).
- Add a component and import it with `~` alias:

    // src: components/MyButton.vue
    import MyButton from "~/components/MyButton.vue"

- Fetching data (SSR-safe):

    const { data } = await useFetch('/api/products')

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

## Agent guidance — required workflow

- Always read `package.json` before making changes. It is the authoritative source for which modules and versions the project uses; use it to decide which docs to fetch and which APIs are available.

- For library documentation, prefer the internal documentation tool first (`mcp_context7_get-library-docs`) to fetch the authoritative docs for a library (for example use the Nuxt library id `/nuxt/nuxt`). If docs are not available there, fall back to web fetches.

- For `@nuxt/ui` components, use `mcp_nuxt-ui_get_component` to retrieve up-to-date component metadata (props, slots, events). This helps create correct usage and tests for UI components.

- MCP server: prefer the project's MCP server (if present) as the primary source of project-specific context. Search for `server/`, `server/api/`, or `mcp/` directories to locate it. If an MCP server endpoint is available, use it to request project context before making edits.

- Recommended agent sequence (minimal):
    1. Read `package.json` (read_file) to list dependencies and scripts.
    2. For each important dependency (Nuxt, Nuxt UI, Nuxt Image), call `mcp_context7_get-library-docs` with the library id (example: `/nuxt/nuxt`).
    3. For Nuxt UI components you will modify, call `mcp_nuxt-ui_get_component` with the component name to fetch props and examples.
    4. Check for an MCP server in the repo and query it for project-specific context if available.

This workflow ensures the agent always uses the repo's declared modules and up-to-date upstream docs when proposing edits.

---

If anything here is unclear or there are additional local conventions you want captured (build variants, CI steps, environment variables, or preferred test commands), tell me and I will iterate the file.

## Code review guidance for agents (GitHub PR)

When acting as an automated reviewer for GitHub pull requests, follow these rules to produce concise, actionable reviews.

- Score the PR in four categories with a numeric score (0–100) and an emoji indicator. Scores should be integers in the range 0–100 (round any computed decimals):
    - Code Quality — readability, maintainability, style
    - Performance — algorithmic and runtime considerations
    - Security — input validation, secrets, vulnerabilities
    - SSR — server-side rendering safety and hydration correctness

- Use emoji ranges to make scores scannable (inclusive ranges):
    - 🔴 0–39: critical problems
    - 🟡 40–69: needs improvement
    - 🟢 70–100: acceptable / good

- For each category output a single-line summary (human-readable), e.g.:
    - Code Quality: 78 🟢 — Good overall; minor naming and duplication issues.

- When proposing fixes, DO NOT paste entire files. Instead provide a short, precise pointer and a minimal suggested change. Include a file path and a line range or a minimal diff/snippet so the author can apply the fix quickly:
    - Location: `app/pages/sign-in/index.vue` (lines 3–7)
    - Issue: Missing onMounted() guard around `localStorage` access.
    - Suggestion: Wrap access in `onMounted(() => { /* use localStorage here */ })`.
    - Why: Accessing `localStorage` during SSR causes hydration mismatch and lint error.

- Prioritize fixes by severity and keep each suggestion to 1–3 short lines (what to change + one-sentence rationale).

- Pass / Fail rule for PR title prefix (deterministic):
    - If ALL four category scores are >= 70 (and none of the categories falls in the 🔴 range 0–39), suggest PR title prefix: `[✅ PASS] <original title>`.
    - Otherwise suggest prefix: `[❌ NEED FIX] <original title>`.
    - Also include a short summary line in the review giving the recommended prefix.

- Example final review summary (compact, machine-friendly + human):
    - Human-readable summary example:
        - Summary: `[❌ NEED FIX]` — Code Quality 62 🟡, Performance 55 🟡, Security 90 🟢, SSR 45 🟡
        - Fixes:
            1. Location: `app/pages/sign-in/index.vue` (lines 3–7)
               Issue: Missing onMounted() guard around `localStorage` access.
               Suggestion: Wrap access in `onMounted(() => { /* use localStorage here */ })`.
    - Optional machine-readable JSON (for bots/CI):
        {
          "summary_prefix": "❌ NEED FIX",
          "scores": {"code_quality":62,"performance":55,"security":90,"ssr":45},
          "fixes": [{"path":"app/pages/sign-in/index.vue","lines":"3-7","suggestion":"Wrap access in onMounted(...)"}]
        }

This format keeps reviews fast to scan, actionable for engineers, and suitable for automated PR comments, status checks, or CI integrations.
