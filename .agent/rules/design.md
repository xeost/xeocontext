---
trigger: always_on
---

This system basically:
- Renders Markdown, OpenAPI, and AsyncAPI content
- Gets the content to display from the `content` directory
- The application configuration is located in the `content/xeocontext.config.json` file
- Displays three tabs: "System Design," "OpenAPI" (optional, only if an `openapi` item exists in the configuration), and "AsyncAPI" (optional, only if an `asyncapi` item exists in the configuration)
- The "System Design" tab renders the Markdown content, structured as indicated by the `navigation` item in the configuration. It has two sidebars, one on each side. The browser path must begin with `/system-design/...`
- The "OpenAPI" tab displays content from the OpenAPI description, starting with the file specified in the `openapi` item in the configuration. The OpenAPI description can be divided into several YAML files and connected using `$ref` references. It does not have sidebars. The path in the browser must be `/openapi`.
- The "AsyncAPI" tab displays the AsyncAPI description, starting with the file specified in the `asyncapi` item in the configuration. The AsyncAPI description can be split across multiple YAML files and connected using `$ref` references. It does not have sidebars. The path in the browser must be `/asyncapi`.