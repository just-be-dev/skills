#!/usr/bin/env bun

/**
 * Validates all Claude plugin manifests against their schemas.
 * Checks marketplace.json and all plugin.json files in the plugins directory
 * using the Claude CLI validation command.
 */

import { $ } from "bun";
import { readdirSync, statSync } from "fs";
import { join } from "path";

console.log("🔍 Validating Claude Plugin Schemas");
console.log("====================================");
console.log("");

let passed = 0;
let failed = 0;

// Validate marketplace manifest
console.log("📦 Validating marketplace manifest...");
try {
  await $`claude plugin validate .claude-plugin/marketplace.json`;
  passed++;
} catch (error) {
  failed++;
}
console.log("");

// Find and validate all plugin manifests
console.log("🔌 Validating plugin manifests...");

function findPluginManifests(dir: string): string[] {
  const manifests: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          const pluginJsonPath = join(fullPath, ".claude-plugin", "plugin.json");
          try {
            statSync(pluginJsonPath);
            manifests.push(pluginJsonPath);
          } catch {
            // plugin.json doesn't exist, continue searching subdirectories
            manifests.push(...findPluginManifests(fullPath));
          }
        }
      } catch {
        // Skip if we can't stat the file
        continue;
      }
    }
  } catch {
    // Skip if we can't read the directory
  }

  return manifests;
}

const pluginManifests = findPluginManifests("plugins");

for (const pluginFile of pluginManifests) {
  console.log(`Validating: ${pluginFile}`);
  try {
    await $`claude plugin validate ${pluginFile}`;
    passed++;
  } catch (error) {
    failed++;
  }
  console.log("");
}

// Summary
console.log("====================================");
console.log("📊 Summary:");
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log("");

if (failed === 0) {
  console.log("✨ All validations passed!");
  process.exit(0);
} else {
  console.log("⚠️  Some validations failed");
  process.exit(1);
}
