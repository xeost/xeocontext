---
domain: common
specs:
  rest: ./openapi.yaml
  events: ./asyncapi.yaml
---

# Common Domain

## Overview
This domain holds shared components, schemas, and standards reused across other domains. It ensures consistency in error handling, pagination, and basic data types.

## Shared Schemas
- **Error & ErrorDetail:** Standardized error response format (RFC 7807 inspired).
- **Pagination:** Standard pagination metadata for list responses.
