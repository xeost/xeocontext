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
  - [Why Domain-Driven Structure?](#why-domain-driven-structure)
  - [Directory Structure](#directory-structure)
  - [The xeocontext.config.json file](#the-xeocontextconfigjson-file)
  - [The .agent/rules/content.md file](#the-agentrulescontentmd-file)
- [Extra Tips](#extra-tips)
  - [Content Validation](#content-validation)

## Features

### Core Viewers

- **System Design Viewer**:
  - Renders Markdown documents with GitHub Flavored Markdown (GFM).
  - **Mermaid Diagrams**: Native support for Flowcharts, Sequence diagrams, C4 diagrams, classes, and more.
  - **Smart Navigation**: Recursive sidebar navigation with support for nested items.
  - **SEO Optimized**: dynamic document title and description updates based on frontmatter.
- **OpenAPI Viewer**:
  - Interactive REST API documentation using a custom implementation of **Swagger UI**.
  - **Dark Mode Support**: Fully customized theme that adapts to the application's dark mode.
  - **Server-Side Dereferencing**: Resolves all `$ref` pointers (internal and external) to ensure stability.
- **AsyncAPI Viewer**:
  - Event-Driven Architecture visualization using the AsyncAPI React component.
  - Supports dereferencing of AsyncAPI schemas from external URLs.

### Architecture & Experience

- **Theme Support**: Seamless switching between Light, Dark, and System modes.
- **Dynamic Content**: Content is decoupled from code. Loads configuration and documentation from local files or Git repositories.
- **Docker Ready**:
  - Production-optimized image (`xeost/xeocontext:latest`).
  - Live-reload image for development (`xeost/xeocontext-live-reload:latest`).
- **Customizable Deployment**: Built-in scripts (`setup-content`) to easily deploy your own instance to Vercel or other platforms, syncing content from your own repository.
- **Modern Stack**: Built with Next.js 16 (App Router) and Turbopack.

## AI Integration

This repository is designed to be the "Source of Truth" for system design. The `content` directory is intended to be read by AI Coding Agents (via MCP Servers or direct access) to scaffold and maintain other repositories based on the designs defined here. But from a clean system design content repository, see [`examples/markdown-openapi-asyncapi`](examples/markdown-openapi-asyncapi) for a quickstart.

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
   Modify the files in the `content` directory. The viewer will automatically reload to reflect your changes. See [Content Configuration](#content-configuration) for more details.

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

The application reads from the `/content` directory (or the value of `XEOCONTEXT_CONTENT_DIR` in the environment).

### Why Domain-Driven Structure?

Organizing your design content by **Domain** (e.g., `identity`, `payments`) rather than by file type is crucial for effective AI-assisted development. This approach creates clear **Context Boundaries**, allowing you to feed an AI agent the complete "truth" about a specific domain—its business logic (Markdown), API contracts (OpenAPI), and events (AsyncAPI)—without distracting noise.

For a deeper dive into this philosophy, read [Harmonizing AI Code Generation with Centralized System Design](https://xeost.com/blog/centralizing-system-design).

### Directory Structure

The content directory follows a strict separation between **Global Architecture** and **Bounded Contexts (Domains)**.

**1. Root Configuration**
- `xeocontext.config.json`: [MANDATORY] The central navigation and metadata map for the viewer.

**2. The "Global" Directory (`/global`)**
Defines the laws of the system and cross-cutting concerns.
- **Gateway (`/global/gateway`)**: Contains the **Master Root** files (`openapi.yaml`, `asyncapi.yaml`). These files aggregate endpoints and channels from all domains to provide a unified "System View".
- **ADRs (`/global/adrs`)**: Architecture Decision Records explaining *why* decisions were made.
- **Standards (`/global/standards`)**: Naming conventions, error handling, etc.

**3. Domain Modules (`/domains`)**
Each folder represents a specific business capability (e.g., `identity`, `payments`).
- **Co-location**: Markdown, OpenAPI, and AsyncAPI specs reside together.
- **Fragmented Architecture**: Actual definitions (Schemas, Paths) should live in `components/` subfolders and be aggregated by the domain's root `openapi.yaml`.

```text
/content
├── xeocontext.config.json        # [MANDATORY] Main configuration
├── global/                       # [MANDATORY] Cross-cutting architecture
│   ├── gateway/                  # Unified System API (Master Roots)
│   │   ├── openapi.yaml          # Imports from all domains
│   │   └── asyncapi.yaml
│   ├── adrs/                     # Architecture Decision Records
│   └── standards/                # Global Standards
└── domains/                      # [MANDATORY] Business Logic
    ├── {domain-name}/            # e.g., identity, payments
    │   ├── readme.md             # Domain overview
    │   ├── openapi.yaml          # Domain-specific API Root
    │   ├── asyncapi.yaml         # Domain-specific Event Root
    │   └── components/           # Reusable schemas & paths
    │       ├── schemas/
    │       └── paths/
```

### The `xeocontext.config.json` file

This file controls the global settings and navigation sidebar of the application.

- **`projectName`**: Displayed in the header.
- **`projectDomain`**: Optional domain name.
- **`navigation`**: An array of sections that defines the **System Design** sidebar.
  - **`title`**: Section header.
  - **`items`**: Link items. Supports up to **3 nested levels**.
    - **`title`**: Link text.
    - **`href`**: Path to the Markdown file (relative to `content`, without `.md` extension). **Important**: The application maps the URL path `/content/some/path` to the file `/content/some/path.md` OR `/content/some/path/readme.md`.
    - **`items`**: (Optional) Sub-items for creating nested menus.
- **`openapi`**: Path to the main OpenAPI definition file. If present, an "OpenAPI" tab will appear in the UI.
- **`asyncapi`**: Path to the main AsyncAPI definition file. If present, an "AsyncAPI" tab will appear in the UI.

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

### The `.agent/rules/content.md` file

This file contains crucial instructions for Large Language Models (LLMs) to understand how to structure and generate content within your user design repository (a repository containing only Markdown, OpenAPI, AsyncAPI, and a `docker-compose.yml`).

It defines the **Domain-Driven Structure**, naming conventions, and best practices for creating cohesive system designs.

**Compatibility:**
- **Local AI Agents**: This file is automatically detected by agents following the `.agent` convention.
- **Windsurf / Cursor**: You can easily adapt these rules for popular AI code editors by copying the content to their respective rule configuration locations (e.g., `.windsurf/rules/content.md` or `.cursor/rules/content.md`).


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
