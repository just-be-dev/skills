---
description: Update marketplace schema from official docs
allowed-tools: WebFetch, Write, Read
---

Update the marketplace schema from the official Claude Code documentation:

1. Fetch the schema from https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema
2. Extract the complete JSON schema definition from the page
3. Validate that the extracted content is valid JSON
4. Update `.claude-plugin/marketplace.schema.json` with the new schema (use 2-space indentation)
5. Show a summary of what was updated and any significant changes to the schema structure

Preserve the complete schema structure including all definitions.
