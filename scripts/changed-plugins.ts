#!/usr/bin/env bun

/**
 * Detects which plugins have been modified compared to origin/main.
 * Can list all changed plugins or return the git diff for a specific plugin.
 * Supports including staged changes and comparing against a specific branch.
 */

import { $ } from "bun";

interface Options {
  staged: boolean;
  branch: string;
  pluginName?: string;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
    staged: false,
    branch: "HEAD",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--staged") {
      options.staged = true;
    } else if (arg === "--branch" && i + 1 < args.length) {
      options.branch = args[i + 1];
      i++;
    } else if (!arg.startsWith("--")) {
      options.pluginName = arg;
    }
  }

  return options;
}

async function getChangedFiles(options: Options): Promise<string[]> {
  try {
    // Fetch latest from origin/main
    await $`git fetch origin main --quiet`.quiet();

    // Build the git diff command
    let diffCommand = `git diff --name-only origin/main...${options.branch}`;

    if (options.staged) {
      // Include staged changes by also checking the index
      const committedFiles = await $`git diff --name-only origin/main...${options.branch}`.text();
      const stagedFiles = await $`git diff --name-only --cached`.text();

      const allFiles = new Set([
        ...committedFiles.trim().split("\n").filter(Boolean),
        ...stagedFiles.trim().split("\n").filter(Boolean),
      ]);

      return Array.from(allFiles);
    } else {
      const result = await $.raw(diffCommand).text();
      return result.trim().split("\n").filter(Boolean);
    }
  } catch (error) {
    return [];
  }
}

function getChangedPlugins(changedFiles: string[]): Set<string> {
  const plugins = new Set<string>();

  for (const file of changedFiles) {
    if (file.startsWith("plugins/")) {
      const parts = file.split("/");
      if (parts.length >= 2) {
        plugins.add(parts[1]);
      }
    }
  }

  return plugins;
}

async function getPluginDiff(pluginName: string, options: Options): Promise<string> {
  try {
    if (options.staged) {
      // Get both committed and staged changes
      const committedDiff = await $`git diff origin/main...${options.branch} -- plugins/${pluginName}`.text();
      const stagedDiff = await $`git diff --cached -- plugins/${pluginName}`.text();

      // Combine both diffs
      if (committedDiff && stagedDiff) {
        return committedDiff + "\n" + stagedDiff;
      }
      return committedDiff || stagedDiff;
    } else {
      return await $`git diff origin/main...${options.branch} -- plugins/${pluginName}`.text();
    }
  } catch (error) {
    return "";
  }
}

async function main() {
  const options = parseArgs();
  const changedFiles = await getChangedFiles(options);
  const changedPlugins = getChangedPlugins(changedFiles);

  // If a specific plugin is requested
  if (options.pluginName) {
    if (!changedPlugins.has(options.pluginName)) {
      process.exit(1);
    }

    const diff = await getPluginDiff(options.pluginName, options);
    if (!diff) {
      process.exit(1);
    }

    console.log(diff);
    process.exit(0);
  }

  // Otherwise, list all changed plugins
  for (const plugin of changedPlugins) {
    console.log(plugin);
  }

  process.exit(changedPlugins.size);
}

main();
