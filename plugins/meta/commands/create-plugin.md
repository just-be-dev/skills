---
description: Create a new plugin by opening a GitHub issue
allowed-tools: Bash, AskUserQuestion
---

# Create Plugin Command

This command creates a new plugin in the repository by opening a GitHub issue that will be implemented by Claude.

## Instructions

When this command is invoked, you should:

1. **Gather plugin information**
   - Ask the user for the plugin name (should be kebab-case, e.g., "my-plugin")
   - Ask the user for a description of what the plugin should do
   - Ask the user for any specific commands the plugin should have
   - Ask the user for any additional context or requirements

2. **Validate the plugin name**
   - Ensure the plugin name is in kebab-case format
   - Check if a plugin with that name already exists in `plugins/` directory
   - If it exists, inform the user and ask if they want to use a different name

3. **Create the GitHub issue**
   - Use the `gh` CLI to create an issue with the following format:

   **Title format**: `Create [plugin-name] plugin`

   **Body format**:
   ```
   @claude 

   Create a new plugin called `[plugin-name]`.

   ## Description
   [User's description of what the plugin should do]

   ## Commands
   [List of commands the plugin should have, if specified]

   ## Requirements
   [Any additional context or requirements]

   ## Plugin Structure
   The plugin should follow the standard structure:
   - `.claude-plugin/plugin.json` with plugin metadata
   - `commands/` directory containing command markdown files
   - Each command should have YAML frontmatter with `description` and `allowed-tools`

   ## Important: Update Marketplace Registry
   After creating the plugin files, you MUST also update the root `.claude-plugin/marketplace.json` file to register the new plugin in the marketplace. Add an entry with the following format:
   ```json
   {
     "name": "[plugin-name]",
     "source": "./plugins/[plugin-name]",
     "description": "[plugin description]"
   }
   ```
   Without this step, the plugin will not be discoverable in the marketplace.

   ## Important: Update README.md
   You MUST also update the root `README.md` file to add the new plugin to the "Available Plugins" section. Add an entry following this format:
   ```markdown
   ### [Plugin Display Name]

   [Brief description of what the plugin does]

   **Install:** `/plugin install [plugin-name]@just-be`
   ```
   Add the new plugin entry after the existing plugins in alphabetical order. Without this step, users won't know about the new plugin.
   ```

4. **Execute the gh command**
   - Run `gh issue create --repo just-be-dev/skills --title "[title]" --body "[body]"`
   - Handle any errors (e.g., if gh is not authenticated)
   - Display the created issue URL to the user

5. **Provide feedback**
   - Confirm the issue was created successfully
   - Provide the issue URL
   - Explain that Claude will automatically implement the plugin based on the issue

## Example Usage

User: `/create-plugin`

You should:
1. Ask for plugin name, description, and commands
2. Validate the name doesn't conflict
3. Create a GitHub issue with the structured format
4. Include `@claude` at the top of the issue body
5. Return the issue URL

## Error Handling

- If `gh` is not installed or authenticated, provide clear instructions
- If the plugin name already exists, suggest alternatives
- If issue creation fails, explain the error and suggest solutions
