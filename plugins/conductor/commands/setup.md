---
description: Set up conductor.json configuration in the current project
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
---

# Conductor Setup Command

This command helps set up conductor.json configuration in the current project as documented at https://docs.conductor.build/core/conductor-json.

## Instructions

When this command is invoked, you should:

1. **Check for existing conductor.json**
   - Look for `conductor.json` in the current directory
   - If it exists, ask the user if they want to overwrite it or update it

2. **Detect mise configuration**
   - Check if `mise.toml` exists in the current directory
   - If it exists, read the file to check for available tasks
   - Look specifically for a `dev` task in the `[tasks.dev]` section

3. **Detect package manager scripts**
   - If no mise config with dev task is found, check for `package.json`
   - Look for common dev scripts: `dev`, `start`, `serve`
   - If it's a different language setup, look for that language's dev scripts
     - If unsure, check the README

4. **Build the conductor.json configuration**
   Create a `conductor.json` file with the following structure:

   ```json
   {
       "scripts": {
           "setup": "<setup-command>",
           "run": "<run-command>"
           "runScriptMode": "conncurrent|nonconcurrent"
       }
   }
   ```

   **For the `setup` field:**
   - If `mise.toml` exists: use `"mise trust && mise install"`
   - If only `package.json` exists: use the appropriate package manager install command:
     - Check for lockfiles to determine package manager:
       - `bun.lockb` → `"bun install"`
       - `pnpm-lock.yaml` → `"pnpm install"`
       - `yarn.lock` → `"yarn install"`
       - `package-lock.json` → `"npm install"`

   **For the `run` field:**
   - If mise config has a `[tasks.dev]` section: use `"mise run dev"`
   - Otherwise if `package.json` has a `dev` script: use `"npm run dev"` (or appropriate package manager)
   - Otherwise if `package.json` has a `start` script: use `"npm run start"` (or appropriate package manager)
   - Otherwise leave it out or ask the user what command to use
   
   **For the `runScriptMode` field:**
   - If you added a run script...
      - Ask the user if they want to run scripts concurrently or non-concurrently
      - If they choose concurrent, set the value to "concurrent"
      - If they choose non-concurrent, set the value to "nonconcurrent"
      - If they choose neither, set the value to "nonconcurrent"

5. **Write the conductor.json file**
   - Create the file with proper JSON formatting

## Example Scenarios

### Scenario 1: Repository with mise and dev task
```toml
# mise.toml
[tasks.dev]
run = "bun run dev"
```

Result:
```json
{
    "scripts": {
        "setup": "mise trust && mise install",
        "run": "mise run dev"
        "runScriptMode": "nonconcurrent"
    }
}
```

### Scenario 2: Repository with mise but no dev task
```toml
# mise.toml
[tools]
node = "20"
```

And `package.json` has:
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

Result:
```json
{
    "scripts": {
        "setup": "mise trust && mise install",
        "run": "npm run dev"
    }
}
```

### Scenario 3: Repository with only package.json
```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

Result:
```json
{
    "scripts": {
        "setup": "bun install",
        "run": "bun run dev"
        "runScriptMode": "nonconcurrent"
    }
}
```

## Error Handling

- If no mise config and no package.json found, ask the user what commands to use
- If the user wants to customize the commands, use AskUserQuestion to get their preferences
- If conductor.json already exists, confirm before overwriting
