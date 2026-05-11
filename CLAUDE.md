# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Claude Code [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) named `just-be`. It is a personal "dotfiles for workflows" — each plugin under `plugins/` packages skills/commands/hooks that the author wants available across machines. Contributions that add plugins the maintainer would not personally use are unlikely to be accepted.

## Toolchain

- **`mise`** manages tool versions and tasks (bun, claude CLI, lefthook are pinned in `mise.toml`). After cloning, `mise install` runs the postinstall hook which calls `bun install` and `lefthook install`.
- **`bun`** runs the TypeScript scripts in `scripts/` directly (no build step).
- The validation/version-bump scripts shell out to the **`claude`** CLI (model `haiku`), so they assume the developer is authenticated with Claude.

## Common commands

```bash
mise run validate                    # validate marketplace.json + every plugin.json via `claude plugin validate`
mise run check-versions              # fail if any changed plugin under plugins/ lacks a version bump vs origin/main
mise run bump-version plugin=<name>  # use Claude haiku to analyze the diff and bump plugin version semver-appropriately
mise run skills:add <skill>          # install a skill via the `skills` CLI, then relocate from .agents/skills/ → plugins/skills-sh/skills/
```

Scripts can also be invoked directly with `bun run scripts/<name>.ts`. `detect-changed-plugins.ts` accepts `--staged`, `--branch <ref>`, and an optional plugin name (in which case it prints the diff for that plugin and exits non-zero if unchanged).

## Repository layout

```
.claude-plugin/marketplace.json   # registry of every plugin — must list each plugins/<name>
plugins/<name>/
  .claude-plugin/plugin.json      # name, description, version (semver), author
  skills/<skill>/SKILL.md         # one directory per skill, with frontmatter (description, allowed-tools)
  hooks/hooks.json                # optional — Claude Code lifecycle hooks (see claude-web)
scripts/                          # bun-run TypeScript automation
```

`plugins/skills-sh/skills/` is the destination for skills installed via the external `skills` CLI; the `skills:add` mise task moves them there from the default `.agents/skills/` location.

## Versioning enforcement (important)

Every change inside `plugins/<name>/` must be accompanied by a bump to that plugin's `plugin.json` `version`. This is enforced in two places:

1. **`lefthook.yml` pre-push hook** (only on branch `main`) runs `verify-version-updates.ts`.
2. **GitHub Actions `check-versions.yml`** runs the same check on every push/PR.

The check works by asking Claude haiku (via `requires-version-bump.ts`) whether the diff is substantive. Pure formatting / typo / comment-only changes are exempt. When in doubt, run `mise run bump-version plugin=<name>` rather than guessing — it follows the same rubric (PATCH = bug fix, MINOR = added skill/command, MAJOR = removed or breaking).

When adding a new plugin: create the `plugins/<name>/.claude-plugin/plugin.json` *and* add an entry to `.claude-plugin/marketplace.json` — `validate-manifests.ts` will fail otherwise.

## GitHub Actions

`claude.yml` is gated on `github.actor == 'just-be-dev'` and `@claude` mentions — issues/PRs from other actors will not trigger it. The `meta` plugin's `/create-plugin` command is designed around this flow: it opens an issue that the action then implements.
