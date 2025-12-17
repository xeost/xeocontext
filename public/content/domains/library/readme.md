---
domain: library
specs:
  rest: ./openapi.yaml
  events: ./asyncapi.yaml
---

# Library Domain

Manages files (Books, Images) and their synchronization state relative to users.

## Synchronization (Local-First)

The synchronization mechanism follows an "Optimistic UI" approach aka Local-First.

1.  **Client-Side**:
    -   Changes (e.g., page turn, bookmark add) are applied immediately to the local database (SQLite/IndexedDB).
    -   A sync job runs periodically or on-event to push changes to `POST /v1/sync`.
2.  **Server-Side**:
    -   The server accepts the changes, resolves conflicts (Last-Write-Wins or Vector Clock), and updates the master state in DB.
    -   The server returns the *latest* state of all modified files.
3.  **Real-Time**:
    -   (Optional) Server pushes updates via Websockets (defined in AsyncAPI) to other active devices of the same user.

### Viewers State
-   **PDF Viewer**: Syncs `lastReadPage` and `bookmarks` list.
-   **EPUB Viewer**: Syncs `cfi` (Canonical Fragment Identifier) or `lastReadPage`.
-   **Image Viewer**: Syncs `favorites` status.
