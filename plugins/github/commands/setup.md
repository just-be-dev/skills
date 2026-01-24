---
description: Set up GitHub repository with best practices configuration
allowed-tools: Bash, Read, AskUserQuestion, WebFetch
---

# GitHub Setup Command

This command automates GitHub repository creation and configuration with best practices, including disabling merge commits and enabling auto-deletion of merged branches.

## Instructions

When this command is invoked, you should:

### 1. Prerequisites Check

First, verify that the environment is ready:

1. **Check if this is a git repository:**
   ```bash
   git rev-parse --git-dir
   ```
   - If this fails, inform the user: "This directory is not a git repository. Please run `git init` first."
   - Exit the command

2. **Check if gh CLI is installed:**
   ```bash
   which gh
   ```
   - If this fails, inform the user: "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
   - Exit the command

3. **Verify gh authentication:**
   ```bash
   gh auth status
   ```
   - If this fails, inform the user: "You are not authenticated with GitHub CLI. Please run `gh auth login` first."
   - Exit the command

If all prerequisites pass, proceed to the next step.

### 2. Remote Origin Check

Check if the repository already has a GitHub remote:

```bash
git remote get-url origin
```

- **If origin exists:** Skip to step 4 (Configuration)
- **If origin does not exist:** Proceed to step 3 (Creation)

### 3. Repository Creation (if needed)

If no origin exists, guide the user through creating a new GitHub repository:

1. **Get default values:**
   ```bash
   # Get GitHub username
   gh api user --jq .login

   # Get current directory name for repo name
   basename "$(pwd)"
   ```

2. **Prompt user with AskUserQuestion:**
   Ask the user to configure the repository with these questions:

   - **Question 1:** "What should be the repository owner?"
     - Options: `[username from gh api]` (default), "Custom owner"
     - If "Custom owner" is selected, ask for the custom value

   - **Question 2:** "What should be the repository name?"
     - Options: `[directory name]` (default), "Custom name"
     - If "Custom name" is selected, ask for the custom value

   - **Question 3:** "Should the repository be public or private?"
     - Options: "public", "private"

3. **Create the repository:**
   ```bash
   gh repo create <owner>/<repo> --<public|private> --source=. --remote=origin
   ```

4. **Handle errors:**
   - If repository already exists: "Repository `<owner>/<repo>` already exists on GitHub. You may want to use a different name or add the existing repository as a remote with: `git remote add origin https://github.com/<owner>/<repo>.git`"
   - If permission denied: "You don't have permission to create a repository under `<owner>`. Please verify you have access or use a different owner."
   - If network error: "Network error occurred. Please check your internet connection and try again."
   - For any creation error, exit the command

### 4. Repository Configuration

Now configure the repository with best practices:

1. **Get the repository identifier:**
   ```bash
   gh repo view --json nameWithOwner --jq .nameWithOwner
   ```
   This gives you the `owner/repo` format needed for configuration.

2. **Check and generate repository description (if needed):**

   First, check if a description already exists:
   ```bash
   gh repo view --json description --jq .description
   ```

   **If description already exists and is not empty:**
   - Skip description generation and setting
   - Preserve the existing description

   **If description is empty or null, generate a new one:**

   **If README.md exists:**
   - Read the README.md file (first 500 characters)
   - Use AI to summarize it into a concise 50-80 character description
   - Skip markdown headers (lines starting with #), code blocks (lines between ```)
   - Focus on extracting the core purpose of the project

   **If README.md does not exist:**
   - Convert the directory name to Title Case
   - Use that as the description

   Example: `my-awesome-project` → `My Awesome Project`

3. **Apply repository settings:**

   Run these commands separately for better error reporting:

   ```bash
   # Disable merge commits
   gh repo edit --enable-merge-commit=false

   # Enable auto-delete of branches on merge
   gh repo edit --delete-branch-on-merge

   # Set repository description (only if generated in step 2)
   gh repo edit --description "..."
   ```

   **Error handling for configuration:**
   - If any individual command fails, log the error but continue with remaining commands
   - Track which configurations succeeded and which failed
   - Report all errors at the end

### 5. Verification & Success Message

1. **Verify final configuration:**
   ```bash
   gh repo view --json url,description,deleteBranchOnMerge,mergeCommitAllowed
   ```

2. **Display success message:**
   Show the user:
   - ✓ Repository URL
   - ✓ Description
   - ✓ Settings applied:
     - Merge commits: disabled
     - Auto-delete branches on merge: enabled

3. **Suggest next steps:**
   ```
   Your GitHub repository is now configured with best practices!

   Next steps:
   - Push your code: git push -u origin main
   - Start working on your project
   ```

   If the repository is in detached HEAD state or has no commits yet, adjust the push suggestion accordingly.

## Error Handling Summary

- **Git not a repository:** Inform and exit with clear instructions
- **gh not installed:** Provide installation link and exit
- **gh not authenticated:** Instruct to run `gh auth login` and exit
- **Repository already exists:** Suggest alternatives and exit
- **Permission errors:** Verify access and suggest solutions
- **Network errors:** Suggest retry
- **Partial configuration failures:** Continue with remaining steps, report all errors at the end

## Edge Cases

- **Repository exists on GitHub but not as remote:** User will proceed to configuration
- **Detached HEAD state:** Adjust push suggestions to current branch or commit
- **Empty git repository (no commits):** Adjust push suggestions accordingly
- **Organization repositories:** User can specify custom owner
- **README with complex markdown:** Skip headers, code blocks; extract core content only

## Example Flow

### Scenario 1: Fresh repository, no remote

```
Prerequisites ✓
No remote origin found.

Creating GitHub repository...
Repository owner: justinbennett (default)
Repository name: my-project (default)
Visibility: private

✓ Repository created: https://github.com/justinbennett/my-project

Configuring repository settings...
✓ Merge commits disabled
✓ Auto-delete branches enabled
✓ Description set: "My Project"

Next steps:
- Push your code: git push -u origin main
```

### Scenario 2: Existing remote, needs configuration

```
Prerequisites ✓
Remote origin found: https://github.com/justinbennett/existing-repo

Configuring repository settings...
✓ Merge commits disabled
✓ Auto-delete branches enabled
✓ Description preserved: "A comprehensive tool for managing project dependencies"

Repository configured successfully!
URL: https://github.com/justinbennett/existing-repo
```

## Notes

- This command is idempotent - safe to run multiple times
- Configuration commands set desired state, so re-running will update settings
- Existing repository descriptions are preserved and never overridden
- Always check prerequisites first to fail fast with helpful messages
- Continue through configuration steps even if some fail, but report all errors
