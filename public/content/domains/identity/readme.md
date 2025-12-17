---
domain: identity
specs:
  rest: ./openapi.yaml
---

# Identity Domain

This domain manages User Identities, Authentication, and Authorization.

## Key Entities
- **User**: Represents a registered user.
- **Role**: Definition of permissions (e.g., User, Admin).

## Services
- **Auth Service**: Handles Login, Registration, JWT issuance.
- **User Service**: Managed User CRUD.
