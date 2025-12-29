---
domain: projects
specs:
  rest: ./openapi.yaml
  events: ./asyncapi.yaml
---

# Projects Domain

## Overview
The Projects domain is the core of the XeoDocs system. It manages the lifecycle of documentation projects, their target languages, and the files within them. It also handles the synchronization logic with upstream repositories and the "Next File" logic for the CLI workflow.

## Key Entities

### Project
Represents a source documentation repository (e.g., from GitHub).
- **Slug:** Unique identifier used for the fork name.
- **Sync State:** Tracks the last commit hash synchronized from upstream.

### Language
A specific translation target for a project (e.g., Spanish, French).
- **Domain:** Each language version is published to a specific domain.

### File
Represents a single file in the documentation structure.
- **Status:** `pending`, `translated`, `outdated`, `ignored`.
- **Checksums:** Stores SHA-256 hashes of original and translated content to detect changes efficiently.

### IgnoredPath & SpecialPath
- **IgnoredPath:** Patterns to exclude from translation (like .gitignore).
- **SpecialPath:** Patterns that trigger specific rules (e.g., "disable analytics in this file").

## Workflow Logic
This domain powers the CLI commands:
- `xeodocs next`: Determines the next best file to translate.
- `xeodocs submit`: Updates file status after translation.
- `xeodocs sync`: Managed via background workers and state updates.
