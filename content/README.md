# ExampleApp System Design

Welcome to the System Design repository for **ExampleApp**.

## Architecture Overview

This system follows a **Domain-Driven Design (DDD)** approach, split into the following domains:

-   **[Identity](/domains/identity)**: User management and authentication.

## API Specifications

This repository contains the authoritative API definitions:

-   **Rest API (OpenAPI)**: Aggregated at [Global Gateway](/global/gateway/openapi.yaml).

## Content Validation

It is recommended to validate your spec files before committing changes to ensure the viewer renders them correctly.

### OpenAPI Validation
You can use [Redocly CLI](https://redocly.com/docs/cli/) to lint and bundle your OpenAPI definitions.

```bash
# Lint the main gateway file (and all its references)
pnpm --package=@redocly/cli dlx redocly lint content/global/gateway/openapi.yaml

# Lint a specific domain file
pnpm --package=@redocly/cli dlx redocly lint content/domains/identity/components/paths/auth_login.yaml
```

### AsyncAPI Validation
You can use [AsyncAPI CLI](https://www.asyncapi.com/docs/tools/cli) to validate your AsyncAPI definitions.

```bash
# Validate the main gateway file
pnpm dlx @asyncapi/cli validate content/global/gateway/asyncapi.yaml
```
