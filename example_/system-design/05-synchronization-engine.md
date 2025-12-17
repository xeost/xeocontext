# Synchronization Engine (Local-First)

The "Jewel" of our system is the synchronization engine designed to support the **Library**, **PDF Viewer**, **EPUB Viewer**, and **Image Gallery**.

## Philosophy: Local-First
In a Local-First application, the **client's local database is the primary source of truth** for the user interface. The network is merely a synchronization mechanism to keep other devices in check.

### Key Concepts

1.  **Optimistic UI**: We apply changes instantly locally. We assume the server will accept them. If the server rejects them (rare), we roll back.
2.  **Offline Capability**: The App works 100% without internet. Changes are queued in an `ActionQueue` (e.g., RxDB replication log).
3.  **Conflict Resolution**: We use **Last-Write-Wins (LWW)** based on high-precision client timestamps for simple properties like "Last Page Read".

## Sync Protocol (Over WebSocket)

We utilize the `/v1/sync` endpoint defined in our **AsyncAPI** spec.

### 1. The "Delta" Sync
Instead of sending the full state every time, clients send diffs.
*   **Client**: "User bookmarked page 10" -> Sends `{ type: 'bookmark_add', page: 10 }`
*   **Server**: Applies patch.
*   **Broadcast**: Sends `{ type: 'bookmark_add', page: 10 }` to other connected clients.

### 2. State Reconciliation (Initial Load)
When a device comes online:
1.  It establishes a WSS connection.
2.  It sends its `last_synced_at` timestamp.
3.  The Server queries the `SyncEvents` table for all events occurred *after* that timestamp.
4.  The Server flushes these events to the client.

## Viewer Specifics

### PDF Viewer Sync
*   **Data Point**: `page_number` (Integer).
*   **Challenge**: Different devices might display pages differently (e.g., mobile reflow).
*   **Solution**: We strictly sync the *Logical Page Number* of the PDF.

### EPUB Viewer Sync
*   **Data Point**: `CFI (Canonical Fragment Identifier)`.
*   **Why**: EPUBs are reflowable HTML. "Page 5" means nothing if I change font size.
*   **Mechanism**: We sync the CFI string `epubcfi(/6/4[chap1ref]!/4/2/1:0)`. A client receiving this scrolls to the exact paragraph, regardless of screen size.

### Image Gallery Favorites
*   **Data Point**: `favorite_boolean`.
*   **Pattern**: Low latency toggle. The "Heart" animation must be instant. The WSS message is fire-and-forget.
