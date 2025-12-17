# General Code Conventions

While individual languages (TS, Go, Rust) have their own linters, these rules apply globally to the repo.

## 1. Language & Locale
-   **English Only**: Code, comments, commit messages, and documentation MUST be in English.
-   **No Localized Code**: Do not hardcode Spanish/French strings in the backend logic; use i18n keys if necessary.

## 2. Naming Conventions overview
-   **Databases**: `snake_case` (e.g., `user_id`, `created_at`).
-   **JSON/API**: `camelCase` (e.g., `userId`, `createdAt`).
-   **Environment Variables**: `UPPER_SNAKE_CASE` (e.g., `DB_CONNECTION_STRING`).

## 3. Git Workflow
-   **Branches**: Use feature branches (`feature/add-login`, `fix/sync-bug`). Do not push directly to `main`.
-   **Commits**: Use Conventional Commits (`feat: add login endpoint`, `fix: resolve sync conflict`).

## 4. Documentation
-   **ADRs**: Whenever a significant architectural decision is made, create a new Record in `global/adrs`.
-   **OpenAPI**: Do not implement an API endpoint that is not first defined in the `domains/{domain}/openapi.yaml`. API First!
