---
name: effect-setup
description: Bootstrap or align an Effect 4 project to the tidy.place house setup — beta deps, tsgo + effect-tsgo patch, @effect/language-service tsconfig plugin, Zed vtsls→tsgo wiring, and the effect-solutions consultation rule. Use when a project needs Effect installed for the first time, when migrating from Effect 3 to Effect 4 beta, or when adding tsgo/Zed config to an existing Effect 4 project.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
user-invocable: true
---

# Effect Setup 

Bootstrap or repair an Effect 4 project

- **Effect 4 beta** (`effect@4.0.0-beta.x`, `@effect/platform-*`) — not Effect 3.
- **`tsgo`** (the TypeScript native preview) for type-checking, patched for Effect via `effect-tsgo patch` from `@effect/tsgo`.
- **`@effect/language-service`** as a tsconfig plugin so editors get Effect-aware diagnostics and refactors.
- **Zed `.zed/settings.json`** wires `vtsls` to the local `tsgo` binary via `--lsp --stdio`.
- **Bare-module imports** (`import * as Effect from "effect/Effect"`), not `import { Effect } from "effect"`.
- **`effect-solutions`** is consulted before writing Effect code — record this in `CLAUDE.md`.

## When to invoke

Run when the user says any of: "set up effect", "add effect to this project", "match the tidy.place effect setup", "configure tsgo for effect", "wire effect-tsgo", or when starting a new project that will use Effect 4.

Do **not** run unprompted on a project that already has Effect 3 stable working — migrating to Effect 4 beta is a deliberate choice the user must opt into.

## Workflow

### Step 1 — Inspect the project

Before changing anything, read:

- `package.json` — what's installed, what version of `effect` (if any), whether `@effect/tsgo` is present.
- `tsconfig.json` — current compilerOptions, plugins, schema reference.
- `.zed/settings.json` if present.
- `mise.toml` / `.mise.toml` if present (the repo uses mise for tasks).
- `CLAUDE.md` / `AGENTS.md` to see whether the effect-solutions rule is already documented.

Determine which of the four pieces (deps, tsconfig, zed, claude-md) are missing or out of date. Only touch the missing pieces — don't churn files that already match.

### Step 2 — Confirm scope (only if ambiguous)

If the project already has `effect@3.x` installed, ask before bumping to beta. If there's no `.zed` directory, ask whether the user wants Zed config (they may use a different editor). For greenfield projects with nothing in place, just proceed.

### Step 3 — Apply each piece

#### 3a. `package.json` — beta deps + scripts

Target shape (versions are the tidy.place baseline; let `bun install` resolve to current latest beta if the user prefers):

```json
{
  "scripts": {
    "typecheck": "tsgo --noEmit",
    "prepare": "effect-tsgo patch"
  },
  "devDependencies": {
    "@effect/tsgo": "^0.5.2",
    "@typescript/native-preview": "^7.0.0-dev.20260509.2"
  },
  "peerDependencies": {
    "typescript": "^6.0.3"
  },
  "dependencies": {
    "effect": "4.0.0-beta.64"
  }
}
```

For React projects, also add:

```json
{
  "dependencies": {
    "@effect/atom-react": "^4.0.0-beta.65"
  }
}
```

For Bun/Node platform packages, pin to the same beta line as `effect`:

```json
{
  "dependencies": {
    "@effect/platform-bun": "4.0.0-beta.64",
    "@effect/platform-node": "4.0.0-beta.64"
  }
}
```

Critical notes:
- `prepare: "effect-tsgo patch"` runs automatically after `bun install`. This patches the `tsgo` binary to understand Effect's type-level constructs. Without it, `tsgo --noEmit` reports spurious errors on Effect code.
- The `typescript@^6` peerDependency is required by `@typescript/native-preview` — install it as a peer, not a direct dep.
- After editing `package.json`, run `bun install` so the `prepare` hook fires and patches tsgo.

#### 3b. `tsconfig.json` — language service plugin

```json
{
  "$schema": "https://raw.githubusercontent.com/Effect-TS/language-service/refs/heads/main/schema.json",
  "compilerOptions": {
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,
    "types": ["bun"],

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "plugins": [
      { "name": "@effect/language-service" }
    ]
  }
}
```

Key bits to preserve when merging into an existing tsconfig:
- The `$schema` line — it gives the user JSON-schema completion for Effect-aware tsconfig fields.
- `plugins: [{ "name": "@effect/language-service" }]` — required for editor refactors like "Add missing yield\*", "Add tag annotation", etc.
- `verbatimModuleSyntax: true` and `module: "Preserve"` — Effect 4 ships with explicit `import type` discipline; these settings keep the bundler honest.
- `noUncheckedIndexedAccess: true` — Effect's `Schema` and `Match` patterns assume this.

Add `"@cloudflare/workers-types"` and `"vite/client"` to `types` only if the project actually uses them (the tidy.place repo does; a vanilla Bun script doesn't).

#### 3c. `.zed/settings.json` — vtsls → tsgo

```json
{
  "languages": {
    "TypeScript": { "language_servers": ["vtsls", "!typescript-language-server"] },
    "TSX":        { "language_servers": ["vtsls", "!typescript-language-server"] },
    "JavaScript": { "language_servers": ["vtsls", "!typescript-language-server"] }
  },
  "lsp": {
    "vtsls": {
      "binary": {
        "path": "${ZED_WORKTREE_ROOT}/node_modules/@typescript/native-preview-darwin-arm64/lib/tsgo",
        "arguments": ["--lsp", "--stdio"]
      }
    }
  }
}
```

The tidy.place repo hard-codes an absolute path. Prefer `${ZED_WORKTREE_ROOT}` if the user might share the file with collaborators on different machines. If they're sole author and don't care, an absolute path matches the repo exactly. **Ask which they want** if unsure.

Also: `darwin-arm64` is platform-specific. On Linux/x64, the directory name will be `linux-x64` etc. For multi-platform teams, prefer the unprefixed `node_modules/.bin/tsgo` — it's a symlink that resolves correctly per-platform.

#### 3d. `CLAUDE.md` (or `AGENTS.md`) — effect-solutions rule

Append this section if not already present:

```markdown
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `~/.local/share/effect-solutions/effect` for real implementations

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
```

If `AGENTS.md` is a symlink to `CLAUDE.md` (as in tidy.place), only edit `CLAUDE.md`.

### Step 4 — Verify

After all writes:

```bash
bun install            # triggers `effect-tsgo patch`
bun run typecheck      # should succeed (or surface real errors, not Effect-internal ones)
```

If `typecheck` fails with errors inside `node_modules/effect/**`, the patch didn't take — re-run `bunx effect-tsgo patch` manually and report which file the error is in.

## Import conventions (worth flagging to the user)

Effect 4 ships with deeply-nested module paths. The house style is bare-module imports, not the barrel:

```ts
// ✅ House style
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";

// ❌ Avoid (works, but bigger bundles + slower TS)
import { Effect, Layer, Schema } from "effect";
```

Atom/AtomRegistry live under `effect/unstable/reactivity/` in beta — that's not a typo, the API is still stabilizing.

## What this skill does NOT do

- Does not write Effect application code. For that, follow the CLAUDE.md rule and consult `effect-solutions`.
- Does not migrate Effect 3 codebases to Effect 4 — the API surface changed substantially. If asked, warn the user that this is a separate, larger task.
- Does not add `@effect/platform-*`, `@effect/atom-react`, or other ecosystem packages unless the project clearly needs them. Ask.

## Quick reference: full file set for a new project

If the user wants everything wired from scratch with no existing code:

| File | Purpose |
|------|---------|
| `package.json` | Beta deps + `typecheck` / `prepare` scripts |
| `tsconfig.json` | `@effect/language-service` plugin, strict opts |
| `.zed/settings.json` | vtsls → local tsgo binary |
| `CLAUDE.md` | effect-solutions rule |
| `bunfig.toml` (optional) | Bun preload stubs if targeting Workers |
| `mise.toml` (optional) | Task definitions matching `package.json` scripts |

Create only the files the user actually wants — don't bundle Zed config onto a non-Zed user, don't add `mise.toml` if they're not on mise.
