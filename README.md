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