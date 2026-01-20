#!/usr/bin/env bun

/**
 * Analyzes a git diff to determine if a plugin version update is required.
 * Reads diff from stdin and uses Claude AI to decide whether the changes
 * warrant a version bump based on semantic versioning rules.
 */

import { $ } from "bun";

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  return buffer.toString("utf-8");
}

async function validateVersionUpdate(diff: string): Promise<boolean> {
  if (!diff.trim()) {
    console.error("❌ No diff provided");
    return false;
  }

  const prompt = `You are reviewing changes to a Claude Code plugin to determine if a version update is required.

CHANGES:
\`\`\`diff
${diff}
\`\`\`

RULES FOR VERSION UPDATES:
- NO version update needed for:
  * Pure formatting changes (whitespace, indentation, line breaks)
  * Minor grammar/typo fixes that don't change meaning
  * Comment-only changes
  * Documentation formatting

- VERSION UPDATE REQUIRED for:
  * Changes to plugin.json metadata (name, description, author, etc.)
  * Changes to command/skill/agent configurations
  * Changes to YAML frontmatter in command files
  * Substantive content changes that affect functionality
  * Changes to command instructions or behavior
  * New commands, skills, or agents added
  * Removed commands, skills, or agents

Respond with ONLY ONE WORD:
- "YES" if a version update is required
- "NO" if no version update is needed

Response:`;

  try {
    const result = await $`claude --model haiku -p ${prompt}`.text();
    const response = result.trim().toUpperCase();

    if (response.includes("YES")) {
      console.log("YES");
      return true;
    } else if (response.includes("NO")) {
      console.log("NO");
      return false;
    } else {
      console.error(`⚠️  Unclear response from Claude: "${response}"`);
      console.error(`Defaulting to requiring version update for safety`);
      console.log("YES");
      return true;
    }
  } catch (error) {
    console.error(`❌ Error running Claude analysis:`, error);
    console.error(`Defaulting to requiring version update for safety`);
    console.log("YES");
    return true;
  }
}

async function main() {
  const diff = await readStdin();
  const needsUpdate = await validateVersionUpdate(diff);

  process.exit(needsUpdate ? 1 : 0);
}

main();
