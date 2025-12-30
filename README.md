![XeoContext Header](xeocontext.webp)

# XeoContext

XeoContext is a modern "System Design" visualization tool. It is designed to be a lightweight, self-contained viewer for:

- **System Design documents**: Markdown files with Mermaid diagram support.
- **OpenAPI definitions**: visualized using Swagger UI.
- **AsyncAPI definitions**: visualized using AsyncAPI React component.

XeoContext is designed to be deployed as a Docker container with a read-only volume mounted to provide the content.

## Table of Contents

- [Features](#features)
- [AI Integration](#ai-integration)
- [Usage with Live-reload](#usage-with-live-reload)
- [Production Usage (without Live-reload)](#production-usage-without-live-reload)
- [Deployment on Vercel](#deployment-on-vercel)
  - [Maintaining Your Deployment](#maintaining-your-deployment)
- [Development (Contributing)](#development-contributing)
- [Content Configuration](#content-configuration)
- [Extra Tips](#extra-tips)
  - [Content Validation](#content-validation)

## Features

- **Theme Support**: Light, Dark, and System modes.
- **Static Export**: Runs entirely client-side, no backend required.
- **Dynamic Content**: Content is loaded from the `/content` directory at runtime.
- **Docker Ready**: Designed for volume mounting content.

## AI Integration

This repository is designed to be the "Source of Truth" for system design. The `content` directory is intended to be read by AI Coding Agents (via MCP Servers or direct access) to scaffold and maintain other repositories based on the designs defined here. But from a clean system design content repository, see `examples/markdown-openapi-asyncapi` for a quickstart.

## Usage with Live-reload

For a quick start with a pre-configured environment, you can use the [XeoContext Template](https://github.com/xeost/xeocontext-template).

1. **Clone the template:**
   ```bash
   git clone https://github.com/xeost/xeocontext-template my-system-design
   cd my-system-design
   ```

2. **Run with Docker Compose:**
   The template includes a `docker-compose.yml` configured to use the `xeost/xeocontext-live-reload:latest` image.
   ```bash
   docker compose up -d
   ```

3. **Edit Content:**
   Modify the files in the `content` directory. The viewer will automatically reload to reflect your changes.

**AI Support:**
The template includes `.agent/rules/content.md`, which provides instructions for LLMs on how to structure the design content (DDD, OpenAPI, AsyncAPI).

> **Note:** The template provides a minimal starting point. For comprehensive examples of directory structures and configurations, please refer to the [`examples`](examples) directory in this repository.

## Production Usage (without Live-reload)

If your content is static and will not be edited, you can switch to the production-optimized image for better performance.

1.  Follow the steps in the [Usage with Live-reload](#usage-with-live-reload) section to set up your repository.
2.  Edit the `docker-compose.yml` file and change the image name:

    ```yaml
    services:
      xeocontext:
        image: xeost/xeocontext:latest # Change from xeocontext-live-reload
        # ... rest of the configuration
    ```

## Deployment on Vercel

This workflow allows you to deploy a customized version of XeoContext (with your embedded content) to Vercel.

1.  **Clone the XeoContext Viewer:**
    Start by cloning the base viewer repository.
    ```bash
    git clone https://github.com/xeost/xeocontext.git my-viewer
    cd my-viewer
    pnpm install
    ```

2.  **Check Available Versions:**
    See which versions of XeoContext are available to pin your deployment to.
    ```bash
    pnpm list-releases
    ```

3.  **Create Deployment Repository:**
    Create a new empty repository on GitHub (e.g., `github-user/system-design-example`) where your customized viewer will live.

4.  **Configure Environment:**
    Copy `.env.example` to `.env` and set the following variables:
    ```bash
    cp .env.example .env
    ```

    - **`XEOCONTEXT_CONTENT_TYPE`**: Set to `'local'` (if content is on your machine) or `'git'` (if content is in a remote repo).
    - **`XEOCONTEXT_CONTENT_SOURCE`**: Path to local directory (relative or absolute) or Git URL of your content repository.
    - **`XEOCONTEXT_TAG`**: The XeoContext version tag you want to use (e.g., `v0.1.0`).
    - **`XEOCONTEXT_DEPLOY_REPO`**: The URL of the GitHub repository you created in step 3.

5.  **Sync & Setup:**
    Run the setup script. This will reset the code to the specified tag, copy your content into the `content` directory, and configure the git remotes (`upstream` for updates, `origin` for your deployment).
    ```bash
    pnpm setup-content
    ```

6.  **Push to GitHub:**
    Commit the changes and push to your deployment repository.
    ```bash
    git add .
    git commit -m "Initial deployment"
    git push -u origin main
    ```
    *Note: Connect this repository to Vercel for automatic deployments.*

### Maintaining Your Deployment

**Updating XeoContext Version:**
If a new version of XeoContext is released:
1. Update `XEOCONTEXT_TAG` in your `.env` file.
2. Run `pnpm setup-content`.
3. Commit and push.

**Updating Content:**
If you change your design content (in your local folder or external content repo):
1. Run `pnpm setup-content`.
2. Commit and push.

## Development (Contributing)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Configure Environment:**
   Copy `.env.example` to `.env` and configure `XEOCONTEXT_CONTENT_DIR` to point to a sample content directory.
   ```bash
   cp .env.example .env
   ```
   Open `.env` and uncomment/set:
   ```env
   XEOCONTEXT_CONTENT_DIR=./examples/markdown-openapi-asyncapi
   ```

3. **Run development server:**
   ```bash
   pnpm dev
   ```
4. **Open Application:**
   Navigate to [http://localhost:12051](http://localhost:12051).

## Content Configuration

The application reads from the `content` directory (which becomes `/content` in the production build).

**Directory Structure:**
```
/content
├── xeocontext.config.json  # Main configuration
├── global/                 # Global documentation & shared specs
│   ├── gateway/            # Main Entry Points (OpenAPI, AsyncAPI)
│   │   ├── openapi.yaml
│   │   └── asyncapi.yaml
│   ├── infrastructure.md
│   ├── security.md
│   └── ...
└── domains/                # Domain-driven documentation
    ├── identity/           # Domain subfolders
    │   ├── readme.md
    │   └── openapi.yaml
    └── ...
```

**xeocontext.config.json Example:**
```json
{
    "projectName": "ExampleApp",
    "projectDomain": "exampleapp.com",
    "navigation": [
        {
            "title": "System Architecture",
            "items": [
                { "title": "Overview", "href": "/" },
                { "title": "Infrastructure & HA", "href": "/global/infrastructure" },
                { "title": "Security", "href": "/global/security" },
                { "title": "Database Schema", "href": "/global/database" },
                { "title": "Workflows", "href": "/global/workflows" }
            ]
        },
        {
            "title": "Standards & ADRs",
            "items": [
                { "title": "API Standards", "href": "/global/standards/api-design" },
                { "title": "Error Handling", "href": "/global/standards/error-handling" },
                { "title": "Code Conventions", "href": "/global/standards/code-conventions" },
                { "title": "ADR 001 - DDD", "href": "/global/adrs/001-domain-driven-design" },
                { "title": "ADR 002 - Local First", "href": "/global/adrs/002-local-first-sync" },
                { "title": "ADR 003 - K8s", "href": "/global/adrs/003-k8s-infrastructure" }
            ]
        },
        {
            "title": "Domains",
            "items": [
                { "title": "Identity", "href": "/domains/identity" },
                { "title": "Todos", "href": "/domains/todos" },
                { "title": "Notes", "href": "/domains/notes" },
                { "title": "Library (Sync)", "href": "/domains/library" }
            ]
        }
    ],
    "openapi": "/global/gateway/openapi.yaml",
    "asyncapi": "/global/gateway/asyncapi.yaml"
}
```

## Extra Tips

### Content Validation

It is recommended to validate your spec files before committing changes to ensure the viewer renders them correctly.

#### OpenAPI Validation
You can use [Redocly CLI](https://redocly.com/docs/cli/) to lint and bundle your OpenAPI definitions.

```bash
# Lint the main gateway file (and all its references)
pnpm --package=@redocly/cli dlx redocly lint content/global/gateway/openapi.yaml

# Lint a specific domain file
pnpm --package=@redocly/cli dlx redocly lint content/domains/identity/components/paths/auth_login.yaml
```

#### AsyncAPI Validation
You can use [AsyncAPI CLI](https://www.asyncapi.com/docs/tools/cli) to validate your AsyncAPI definitions.

```bash
# Validate the main gateway file
pnpm dlx @asyncapi/cli validate content/global/gateway/asyncapi.yaml
```
