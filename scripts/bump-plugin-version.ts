#!/usr/bin/env bun

/**
 * Automatically bumps a plugin's version based on git diff analysis.
 * Uses Claude AI to determine the appropriate semantic version bump (major/minor/patch/none)
 * by analyzing staged changes to the specified plugin.
 */

import { $ } from "bun";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

interface PluginJson {
  name: string;
  description: string;
  version: string;
  author?: {
    name: string;
  };
}

function parseArgs(): string | null {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: bump-plugin-version.ts <plugin-name>");
    process.exit(1);
  }

  return args[0];
}

async function getPluginDiff(pluginName: string): Promise<string> {
  try {
    const diff =
      await $`bun scripts/changed-plugins.ts --staged ${pluginName}`.text();
    return diff;
  } catch (error) {
    console.error(`No changes detected for plugin: ${pluginName}`);
    process.exit(1);
  }
}

async function analyzeVersionBump(
  pluginName: string,
  diff: string,
): Promise<{ type: string; reason: string }> {
  const prompt = `Analyze this git diff for the "${pluginName}" plugin and determine the appropriate semantic version bump:

FIRST, determine if ANY version update is needed:
- NO version update (return NONE) for:
  * Pure formatting changes (whitespace, indentation, line breaks)
  * Minor grammar/typo fixes that don't change meaning
  * Comment-only changes
  * Documentation formatting

IF a version update IS needed, determine the type:
- PATCH: Bug fixes or substantive changes to existing functionality that don't alter behavior (e.g., fixing a bug, improving error messages, updating documentation content)
- MINOR: New command, skill, agent, or addition to existing functionality that doesn't break existing behavior
- MAJOR: Removes existing skill/command/agent OR makes changes that drastically alter behavior of existing functionality

CHANGES:
\`\`\`diff
${diff}
\`\`\`

Respond in this exact format:
DECISION: <PATCH|MINOR|MAJOR|NONE>
REASON: <one sentence explaining why>`;

  try {
    // Use Claude CLI with haiku model
    const result = await $`claude --model haiku -p ${prompt}`.text();
    const response = result.trim();

    // Parse the response
    const decisionMatch = response.match(/DECISION:\s*(PATCH|MINOR|MAJOR|NONE)/i);
    const reasonMatch = response.match(/REASON:\s*(.+)/i);

    if (!decisionMatch) {
      console.error("Could not parse decision from response:", response);
      process.exit(1);
    }

    const type = decisionMatch[1].toUpperCase();
    const reason = reasonMatch ? reasonMatch[1].trim() : "No reason provided";

    return { type, reason };
  } catch (error) {
    console.error("Error calling Claude Code CLI:", error);
    process.exit(1);
  }
}

function bumpVersion(version: string, bumpType: string): string {
  const [major, minor, patch] = version.split(".").map(Number);

  switch (bumpType) {
    case "MAJOR":
      return `${major + 1}.0.0`;
    case "MINOR":
      return `${major}.${minor + 1}.0`;
    case "PATCH":
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}

async function updatePluginVersion(
  pluginName: string,
  newVersion: string,
): Promise<void> {
  const pluginJsonPath = join(
    "plugins",
    pluginName,
    ".claude-plugin",
    "plugin.json",
  );

  try {
    const content = await readFile(pluginJsonPath, "utf-8");
    const pluginJson: PluginJson = JSON.parse(content);

    const oldVersion = pluginJson.version;
    pluginJson.version = newVersion;

    await writeFile(
      pluginJsonPath,
      JSON.stringify(pluginJson, null, 2) + "\n",
      "utf-8",
    );

    console.log(
      `✓ Bumped ${pluginName} version: ${oldVersion} → ${newVersion}`,
    );
  } catch (error) {
    console.error(`Error updating plugin.json for ${pluginName}:`, error);
    process.exit(1);
  }
}

async function main() {
  const pluginName = parseArgs();

  if (!pluginName) {
    process.exit(1);
  }

  console.log(`Analyzing changes for plugin: ${pluginName}`);

  const diff = await getPluginDiff(pluginName);

  if (!diff || diff.trim() === "") {
    console.log(`No changes detected for ${pluginName}`);
    process.exit(0);
  }

  console.log("Determining version bump...");
  const { type: bumpType, reason } = await analyzeVersionBump(pluginName, diff);

  console.log(`\nDecision: ${bumpType}`);
  console.log(`Reason: ${reason}\n`);

  if (bumpType === "NONE") {
    console.log(`No version bump needed for ${pluginName}`);
    process.exit(0);
  }

  // Read current version
  const pluginJsonPath = join(
    "plugins",
    pluginName,
    ".claude-plugin",
    "plugin.json",
  );
  const content = await readFile(pluginJsonPath, "utf-8");
  const pluginJson: PluginJson = JSON.parse(content);

  const newVersion = bumpVersion(pluginJson.version, bumpType);

  await updatePluginVersion(pluginName, newVersion);
}

main();
