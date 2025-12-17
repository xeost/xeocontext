# ADR 001: Adoption of Domain-Driven Design (DDD) Structure

- **Status**: Accepted
- **Date**: 2025-12-17
- **Context**: The application handles distinct business capabilities: Identity, Productivity (Todos/Notes), and Library management. A monolithic structure often leads to tight coupling and maintenance difficulties.
- **Decision**: We will structure the system and repository using **Domain-Driven Design (DDD)** principles.
- **Consequences**:
    -   **Positive**: Clear separation of concerns. Each domain (`identity`, `todos`, `library`) evolves independently. Easier for teams to own specific domains.
    -   **Negative**: Initial overhead in setting up separate folders and potentially separate microservices.
    -   **Implementation**: The `domains/` folder will be the root for Bounded Contexts. All specs (OpenAPI/AsyncAPI) must be co-located within their domain.
