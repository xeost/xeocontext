---
trigger: always_on
---

# System Design Repository Structure & Rules

This repository hosts the **pure system design content** (Markdown, OpenAPI, AsyncAPI) for the software project, decoupled from the application code.

When analyzing this repository or generating code based on it, adhere to the following structural rules and Domain-Driven Design (DDD) principles.

## 1. Directory Structure Overview

The content is located in `public/content` and follows a strict separation between **Global Architecture** and **Bounded Contexts (Domains)**.

```text
/public/content
├── xeocontext.config.json        # [MANDATORY] The central navigation and metadata map.
├── global/                       # [MANDATORY] Cross-cutting architectural decisions.
│   ├── adrs/                     # Architecture Decision Records.
│   └── standards/                # Coding conventions, API guidelines, etc.
└── domains/                      # [MANDATORY] Business Logic Modules.
    ├── {domain-name}/
    │   ├── readme.md             # [MANDATORY] Domain overview and design.
    │   ├── openapi.yaml          # [OPTIONAL] REST API definition.
    │   └── asyncapi.yaml         # [OPTIONAL] Event-Driven Architecture definition.

```

## 2. The "Global" Directory (The Constitution)

This directory defines the laws of the system. **Always read this first** before generating implementation code.

* **ADRs (`/global/adrs`):** Explain *why* technical decisions were made.
* **Standards (`/global/standards`):** Define naming conventions, error handling patterns, and security protocols that apply to ALL domains.
* **Infrastructure:** Defines shared resources (Kubernetes, Databases, Cloud Providers).

## 3. Domain Modules (Bounded Contexts)

Each folder under `/domains` represents a specific business capability.

* **Co-location:** All documentation, API specs, and Event specs related to a domain must reside within that domain's folder.
* **Isolation:** A domain should be understandable in isolation, referencing `global` for shared patterns.

## 4. File Content Rules

### A. Markdown (Mandatory)

Every domain MUST contain at least one `.md` file (usually `readme.md`) describing:

* The problem it solves.
* Key entities and relationships.
* **Frontmatter:** Use YAML frontmatter to link to technical specs.

```yaml
---
domain: Identity
specs:
  rest: ./openapi.yaml
  events: ./asyncapi.yaml
---

```

### B. OpenAPI & AsyncAPI (Optional but Structured)

If an API or Event interface exists, it must be defined here using **YAML**.

* **Modularization:** Do NOT create monolithic files. Use `$ref` to split definitions.
* **Relative Paths:** Always use relative paths for references (e.g., `$ref: './components/schemas/User.yaml'`).
* **Shared Schemas:** If a model (e.g., `User`) is used in both REST and Events, store it in a shared `schemas` folder within the domain to ensure consistency.

**Folder Structure for Specs:**

```text
/domains/{domain}/
├── openapi.yaml
├── asyncapi.yaml
└── components/
    ├── schemas/    # Shared data models
    ├── messages/   # AsyncAPI messages
    └── paths/      # OpenAPI endpoints

```

## 5. Instructions for LLM / Code Generation

1. **Context Loading:** When asked to implement a feature for a specific domain (e.g., "Payments"), load the context from `domains/payments` AND `global`.
2. **Implementation Consistency:** Ensure generated code follows the patterns defined in `global/standards`.
3. **Spec-First:** If `openapi.yaml` or `asyncapi.yaml` exists, use them as the **source of truth** for generating types, interfaces, and controllers.
4. **Schema Reuse:** If the design links OpenAPI and AsyncAPI to the same schema file, generate a single shared data model in the codebase.

