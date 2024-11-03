# Emoji Kitchen, Made to Order FORK
This is for generating emojis on the fly.
Special thanks to [emojipedia.org](emojipedia.org) for providing all of the emoji resources required for this application.

View below for the original information
# 🧑‍🍳 Emoji Kitchen

This repository contains the source code for the website [https://emojikitchen.dev](https://emojikitchen.dev).

This website allows for quick and easy browsing of the comprehensive list of supported emoji mashups as part of Google's [Emoji Kitchen](https://emojipedia.org/emoji-kitchen/).

There are currently over 100,000 possible valid combinations showcasing the unique illustrations and combined emoji!

## Getting Started

This repository leverages [VSCode's devcontainer](https://code.visualstudio.com/docs/remote/containers) feature to ensure all necessary dependencies are available inside the container for development.

### Application

Instead, now you only need
```bash
npm install && npm start
```

This will start the application on your local machine, running on [http://localhost:5173/](http://localhost:5173).

### Deployments

All application deployments are managed via GitHub Actions and the [`./.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) workflow.

Additionally, application dependencies are automatically managed and updated via Dependabot and the [`./.github/workflows/automerge-dependabot.yml`](./.github/workflows/automerge-dependabot.yml) workflow.
