# REST API Design Standards

All APIs in ExampleApp MUST adhere to the following standards to ensure consistency and usability.

## 1. URI Structure

-   **Base URL**: All endpoints must be versioned. The pattern is `/{version}/{resource}`.
    -   Example: `/v1/todos`
    -   🚫 Anti-pattern: `/api/v1/todos` (Do not use `/api`)
-   **Resources**: Use plural nouns for resources.
    -   `GET /v1/users` (List)
    -   `GET /v1/users/{id}` (Detail)
-   ** casing**: Use `kebab-case` for URIs if multiple words are needed (though single words are preferred).

## 2. JSON Standards

-   **Case**: All JSON property keys MUST be in `camelCase`.
    -   Example: `{ "firstName": "John", "createdAt": "..." }`
-   **Response Envelope**: All successful responses MUST be wrapped in a `data` object. Pagination metadata goes into a sibling `meta` object.

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1
  }
}
```

## 3. HTTP Methods

-   `GET`: Retrieve a resource or collection.
-   `POST`: Create a new resource or trigger a process (e.g., sync).
-   `PUT`: Full update of a resource (replace).
-   `PATCH`: Partial update (preferred for modify operations).
-   `DELETE`: Remove a resource.

## 4. Filtering and Pagination

-   **Pagination**: Use `page` and `limit` query parameters.
    -   Example: `/v1/todos?page=2&limit=50`
-   **Filtering**: Use specific query parameters representing the field name.
    -   Example: `/v1/todos?isCompleted=true`

## 5. Date & Time

-   All timestamps MUST be returned in **ISO 8601** format (`YYYY-MM-DDThh:mm:ssZ`).
-   Always store and transmit dates in UTC.
