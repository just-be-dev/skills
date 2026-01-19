# Skills

This project is a [marketplace](https://code.claude.com/docs/en/plugin-marketplaces) for [Claude Code](https://claude.com/claude-code), which allows me to share common skills and commands between machines.

I conceptualize these plugins like dotfiles for workflows. There's often times where I want config files to be setup in certain ways or find myself making similar changes across projects. Instead of trying to hardcode configuration files in environments that may be different, I use these plugins to automate the setup process.

## Installation

To add this marketplace to your Claude Code installation:

```bash
# Add the marketplace using GitHub shorthand
/plugin marketplace add just-be-dev/skills
```

## Installing Plugins

Once the marketplace is added, you can install plugins:

```bash
# Install a plugin from this marketplace
/plugin install mise@just-be

# List available plugins in this marketplace
/plugin marketplace list just-be
```

## Available Plugins

### Mise

[mise](https://mise.jdx.dev/) is a tool for managing development tools and environments. It acts as a simple replacement for make.

**Install:** `/plugin install mise@just-be`

### Meta

The meta plugin is a plugin for managing plugins. It automates the creation of new plugins in this marketplace by opening GitHub issues that Claude automatically implements.

**Install:** `/plugin install meta@just-be`

**Commands:**
- `/create-plugin` - Create a new plugin by opening a GitHub issue and assigning it to claude

## Development

This repository uses [mise](https://mise.jdx.dev/) for task management and includes automated validation and versioning tools.

Run `mise install` to setup all the necessary dependencies. Scripts in this environment do make use of claude code so it assumes you're authenticated. 

### Available Tasks

Run tasks using `mise run <task>`:

- **`mise run validate`** - Validate marketplace and plugin schemas
- **`mise run check-versions`** - Check if changed plugins need version updates
- **`mise run bump-version plugin=<name>`** - Automatically bump plugin version based on changes

### Scripts

The repository includes several utility scripts in `scripts/`:

- **`changed-plugins.ts`** - Detect which plugins have changed
- **`validate-schemas.ts`** - Validate marketplace.json and plugin.json files 
- **`check-plugin-versions.ts`** - Check if plugin versions need to be updated
- **`validate-plugin-version.ts`** - Validate if a change requires a version bump
- **`bump-plugin-version.ts`** - Automatically determine and apply version bumps

## Contributing

While I'm generally open to contributions, please note that this project is for my personal workflows. I likely won't accept contributions that add plugins that I would be unlikely to use. 

## Resources

- [Claude Code Plugin Marketplaces Documentation](https://code.claude.com/docs/en/plugin-marketplaces)
- [Plugin Development Guide](https://code.claude.com/docs/en/plugins)

## License

MIT License - see [LICENSE](LICENSE) for details.
