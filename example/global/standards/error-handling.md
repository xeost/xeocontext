# Error Handling Standards

Errors must be consistent, informative, and secure.

## 1. HTTP Status Codes

Use standard HTTP codes to indicate the class of error:

-   `400 Bad Request`: Validation failure or malformed JSON.
-   `401 Unauthorized`: Missing or invalid authentication token.
-   `403 Forbidden`: Authenticated, but permissions denied.
-   `404 Not Found`: Resource does not exist.
-   `422 Unprocessable Entity`: Business logic validation failure.
-   `500 Internal Server Error`: Something went wrong on the server side.

## 2. Error Response Format

Errors MUST NOT return the standard `data` envelope. Instead, they return an `error` object.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The email address is already in use.",
    "details": [
      {
        "field": "email",
        "issue": "must be unique"
      }
    ]
  }
}
```

-   **code**: A stable string for programmatic error handling (e.g., `RESOURCE_NOT_FOUND`).
-   **message**: A human-readable message (in English).
-   **details**: (Optional) Array of specific validation errors.
