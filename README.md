# XeoContext

XeoContext is a modern "System Design" visualization tool. It is designed to be a lightweight, self-contained viewer for:

- **System Design documents**: Markdown files with Mermaid diagram support.
- **OpenAPI definitions**: visualized using Swagger UI.
- **AsyncAPI definitions**: visualized using AsyncAPI React component.

XeoContext is designed to be deployed as a Docker container with a read-only volume mounted to provide the content.

## Features

- **Theme Support**: Light, Dark, and System modes.
- **Static Export**: Runs entirely client-side, no backend required.
- **Dynamic Content**: Content is loaded from the `/content` directory at runtime.
- **Docker Ready**: Designed for volume mounting content.

## AI Integration

This repository is designed to be the "Source of Truth" for system design. The `content` directory is intended to be read by AI Coding Agents (via MCP Servers or direct access) to scaffold and maintain other repositories based on the designs defined here. But from a clean system design content repository, see `examples/markdown-openapi-asyncapi` for a quickstart.

## Usage

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run development server:
   ```bash
   pnpm dev
   ```
3. Open [http://localhost:3000](http://localhost:3000).

### Content Configuration

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

### Customization & Deployment

To customize this application with your own content (Markdown, OpenAPI, AsyncAPI) and deploy it to your own repository (e.g., GitHub, to later deploy on Vercel), follow this workflow.

#### 1. Setup Environment
Copy `.env.example` to `.env` and configure the deployment variables:

```bash
cp .env.example .env
```

Edit `.env`:
- **Content Source**: Set `XEOCONTEXT_CONTENT_TYPE` ('local' or 'git') and `XEOCONTEXT_CONTENT_SOURCE`.
- **Version**: Set `XEOCONTEXT_TAG` to the desired XeoContext version (check available versions with `pnpm list-releases`).
- **Deployment**: Set `XEOCONTEXT_DEPLOY_REPO` to your own GitHub repository URL.

#### 2. Run Setup Script
Execute the setup script to position the app on the specified version, sync your content, and configure git remotes:

```bash
pnpm setup-content
```

The script will:
- Reset the application code to the specified `XEOCONTEXT_TAG` (fetching from upstream if needed).
- Replace the `content` directory with your synchronized content.
- Rename the default remote to `upstream` and add your `XEOCONTEXT_DEPLOY_REPO` as `origin` (if not already configured).

#### 3. Push to Deploy
Finally, commit the changes and push to your deployment repository:

```bash
git add .
git commit -m "Deploys XeoContext custom build"
git push -u origin main
```

To update the XeoContext engine in the future, simply update the `XEOCONTEXT_TAG` in `.env` and run `pnpm setup-content` again.

### Docker Deployment

To update the content without rebuilding the image, mount the content directories and configuration file as volumes.

Example with Docker Compose:

```yaml
version: '3.8'

services:
  xeocontext:
    build:
      context: ..
      dockerfile: Dockerfile
    container_name: xeocontext_example_app
    ports:
      - "3000:80"
    volumes:
      # Mount the configuration file
      - ./xeocontext.config.json:/usr/share/nginx/html/content/xeocontext.config.json
      # Mount the content directories
      - ./global:/usr/share/nginx/html/content/global
      - ./domains:/usr/share/nginx/html/content/domains
    restart: unless-stopped
```

Then, run it:

```bash
docker compose up -d
```