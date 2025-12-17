# Database Schema Design

This document outlines the relational schema used by the **Core API** and the **Sync Service**. We utilize **PostgreSQL** for its reliability, JSONB support for flexible metadata, and robust transactional integrity.

## Entity Relationship Diagram

```mermaid
erDiagram
    Users ||--o{ Todos : "owns"
    Users ||--o{ Notes : "owns"
    Users ||--o{ Files : "uploaded by"
    Users ||--o{ SyncState : "tracks"
    
    Users {
        uuid id PK
        string email UK
        string password_hash
        string username
        timestamp created_at
    }

    Todos {
        uuid id PK
        uuid user_id FK
        string title
        string status
        string priority
        jsonb tags
        date due_date
        timestamp created_at
        timestamp updated_at
    }

    Notes {
        uuid id PK
        uuid user_id FK
        string title
        text content
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }

    Files {
        uuid id PK
        uuid user_id FK
        string filename
        string s3_key
        string mime_type
        bigint size_bytes
        jsonb metadata "Ex: { page_count: 50 }"
        timestamp created_at
    }

    SyncState {
        uuid id PK
        uuid user_id FK
        uuid file_id FK
        string resource_type "PDF, EPUB, IMG"
        jsonb progress "Ex: { page: 5, cfi: '...' }"
        jsonb bookmarks "Array of locations"
        timestamp last_synced_at
    }
```

## Table Definitions

### 1. Users
Central identity table.
*   `id`: UUID v4 primary key.
*   `settings`: JSONB column for storing UI preferences (theme, language) without needing a separate table.

### 2. Todos
Task management entities.
*   `status`: ENUM (`pending`, `in_progress`, `completed`, `archived`).
*   `tags`: Stored as a JSONB array for efficient indexing and searching (GAT indices).
*   **Indices**: Composite index on `(user_id, status)` for fast dashboard filtering.

### 3. Notes
Markdown content storage.
*   `content`: Text field. Supports full-text search via `tsvector`.
*   `is_public`: Boolean flag allowing simple sharing capabilities.

### 4. Files (Library)
Metadata for binary assets stored in Object Storage.
*   Crucially separates the *metadata* (searchable, syncable) from the *blob* (S3).
*   `metadata`: Extensible JSONB field.
    *   For PDFs: Stores `page_count`, `author`.
    *   For Images: Stores `dimensions`, `exif`.

### 5. SyncState & Viewer Data
This table powers the **Cross-Device Synchronization** for the viewers.
*   Instead of mutating the `Files` table, we track user-specific progress here.
*   **Conflict Resolution**: Columns like `version` or `last_write_timestamp` (not shown in simple diagram) are used to implement Last-Write-Wins (LWW) strategies.
*   `progress`: Flexible structure.
    *   PDF: `{"page": 42, "x": 0, "y": 100}`
    *   EPUB: `{"cfi": "epubcfi(/6/4[chap1ref]!/4/2/1:0)"}`
