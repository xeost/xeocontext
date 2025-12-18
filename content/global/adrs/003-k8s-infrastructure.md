# ADR 003: Kubernetes (K8s) for Infrastructure

- **Status**: Accepted
- **Date**: 2025-12-17
- **Context**: The requirement specifies a High Availability (HA) deployment. The system consists of multiple stateless services (Identity, Todos, Notes, Library).
- **Decision**: Deploy the application on a **Kubernetes Cluster**.
- **Consequences**:
    -   **Positive**: Industry standard for container orchestration. Built-in mechanisms for HA (ReplicaSets), Service Discovery, and Auto-scaling (HPA). Agnostic to cloud providers.
    -   **Negative**: Operational complexity (learning curve, cluster management).
