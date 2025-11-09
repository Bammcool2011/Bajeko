# Bajeko

> **Note:** This project uses Bun as the package manager. Please use `bun install` and other bun commands.

## Enforcement

This repository enforces the use of Bun and will block npm and pnpm commands. The enforcement is implemented in `tools/check-package-manager.js` and is run via `preinstall` and as a guard at the start of the main npm scripts.

- If you run `npm install` or `pnpm install`, the install will abort with an error directing you to use `bun install`.
- If you run `npm run dev` (or other scripts) the scripts will check the package manager and will fail unless Bun is detected.

To work with this project, install Bun and use the Bun commands documented below.

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

## Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
