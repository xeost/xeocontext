# ADR 002: Local-First Synchronization Strategy

- **Status**: Accepted
- **Date**: 2025-12-17
- **Context**: Users expect the Library and productivity tools to work seamlessly offline and synchronize when connectivity is restored. Traditional "Online-Only" architecture fails this requirement.
- **Decision**: Adopt a **Local-First** architecture with an **Optimistic UI** pattern.
- **Details**:
    -   Clients write to a local database (SQLite/IndexedDB) immediately.
    -   Synchronization happens via a generic `POST /v1/sync` endpoint that accepts a batch of changes.
    -   Server resolves conflicts (Last-Write-Wins based on timestamps) and pushes the latest state.
    -   Complex states (PDF bookmarks, Image favorites) are stored as JSONB blobs (`sync_data`) to allow flexibility without frequent schema migrations.
- **Consequences**:
    -   **Positive**: Excellent user experience (zero latency), offline capability.
    -   **Negative**: Complexity in conflict resolution and client-side storage management.
