---
description: Use Haiku to commit the current changes in logical commits
allowed-tools: Bash, Read
user-invocable: true
model: haiku
---

# Commit Command

This command reviews all staged and unstaged changes and groups them into logical commits with clear, concise messages.

## Instructions

When this command is invoked, you should:

### 1. Review All Changes

First, get an overview of all staged and unstaged changes:

```bash
# Show staged changes
git diff --cached

# Show unstaged changes
git diff

# Show all changed files at a glance
git status
```

Read through all the diffs carefully to understand what has changed.

### 2. Group Changes into Logical Commits

Analyze the changes and group them into logical units. A logical commit should:
- Represent a single coherent change or purpose
- Be independently understandable
- Not mix unrelated concerns (e.g., bug fixes and new features should be separate commits)

Common grouping strategies:
- Group by feature or functionality
- Group by file type or layer (e.g., all config changes together)
- Group by bug fix vs. enhancement
- Keep refactors separate from feature additions

### 3. Write Clear Commit Messages

For each logical group, write a concise commit message following these conventions:
- Use imperative mood: "Add feature" not "Added feature"
- Keep the subject line under 72 characters
- Focus on the "why" when it adds context, not just the "what"
- Use conventional commit prefixes when appropriate: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`

### 4. Execute the Commits

For each logical group:

1. Stage only the relevant files:
   ```bash
   git add <specific-files>
   ```
   Or stage specific hunks interactively if a file contains changes for multiple commits:
   ```bash
   git add -p <file>
   ```

2. Commit with the prepared message:
   ```bash
   git commit -m "<commit message>"
   ```

3. Verify the commit:
   ```bash
   git log --oneline -1
   ```

Repeat for each logical group until all changes are committed.

### 5. Final Summary

After all commits are made, show a summary:

```bash
git log --oneline
```

Display what was committed and confirm all changes are now tracked.

## Notes

- If there are no changes to commit, inform the user
- If all changes belong to a single logical unit, a single commit is appropriate
- Prefer more granular commits over large monolithic ones
- Never skip the review step — understanding changes before committing ensures accurate grouping
