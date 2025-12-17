# API & Workflows

## 1. Authentication Flow
We use standard JWT (JSON Web Token) authentication.

```mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant A as Auth Service
    participant D as Database

    C->>G: POST /v1/auth/login {email, password}
    G->>A: Forward Credentials
    A->>D: Verify Password Hash
    D-->>A: User Valid
    A-->>A: Generate Access Token (15min) & Refresh Token (7d)
    A-->>C: Returns { data: { token, user } }
    
    Note over C: Client stores Token in HttpOnly Cookie or Memory
```

## 2. Todo Creation (Optimistic UI)
To ensure the app feels instant, the client updates the UI *before* the server confirms the action.

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant S as Local Store (RxDB)
    participant API as REST API
    participant DB as PostgreSQL

    UI->>S: 1. Add Todo (Local ID, Status: Syncing)
    S-->>UI: 2. Update List (Instant Feedback)
    
    par Background Sync
        S->>API: 3. POST /v1/todos {title, ...}
        API->>DB: 4. Insert Record
        DB-->>API: 5. Returning UUID
        API-->>S: 6. 201 Created { id: ServerUUID }
        S->>S: 7. Replace Local ID with Server UUID
        S->>S: 8. Mark Status: Synced
    and Failure Case
        S->>API: Network Error / 500
        API-->>S: Error
        S->>UI: Show "Retry" Icon on Todo
    end
```

## 3. Library Synchronization Workflow
The core of the "Local-First" Library experience.

```mermaid
sequenceDiagram
    participant PDF as PDF Viewer
    participant WS as WebSocket Client
    participant Sync as Sync Service
    participant Redis as Pub/Sub

    note over PDF: User scrolls to Page 15

    PDF->>WS: Emit 'reading_progress' { fileId, page: 15 }
    WS->>WS: Optimistic Update Local State
    WS->>Sync: Push WSS Message
    
    Sync->>Sync: Validate Timestamp (LWW)
    Sync->>Redis: Publish 'FILE_UPDATE_CHANNEL'
    Sync->>DB: Persist New Page
    
    par Broadcast
        Redis-->>Sync: Event Received
        Sync-->>OtherDevice: WSS Push { type: 'reading_progress', page: 15 }
        OtherDevice->>OtherDevice: Update Viewer State
    end
```
