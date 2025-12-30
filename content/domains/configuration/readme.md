---
domain: configuration
specs:
  rest: ./openapi.yaml
  events: ./asyncapi.yaml
---

# Configuration Domain

## Overview
The Configuration domain manages system-wide dynamic settings. These settings control background worker behaviors, global prompt templates, and other operational parameters that need to be adjustable without redeploying the backend.

## Key Entities

### Configuration
A key-value pair store for system settings.
- **Keys:** e.g., `worker_wake_interval`, `project_sync_interval`, `system_prompt_template`.
- **Values:** Strings or JSON strings.

## Usage
- **Background Workers:** Read intervals to determine when to wake up.
- **AI Service:** Reads prompt templates to construct context for the LLM.
