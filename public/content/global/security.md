# Infrastructure & Security

## Security Architecture

security is a paramount concern for the ExampleApp. We adopt a "Defense in Depth" strategy.

### 1. Authentication & Authorization
-   **JWT (JSON Web Tokens)**: Used for stateless authentication.
-   **OAuth2 / OIDC**: Supports integration with external providers (Google, GitHub) if needed.
-   **RBAC (Role-Based Access Control)**: Enforce granular permissions (e.g., User vs. Admin) at the API Gateway level.

### 2. Network Security
-   **TLS 1.3**: Enforced for all data in transit (Client <-> LoadBalancer, Ingress <-> Services).
-   **Network Policies**: K8s NetworkPolicies restricted Pod-to-Pod communication (e.g., only specific services can access the DB).
-   **WAF (Web Application Firewall)**: Protects against OWASP Top 10 attacks (SQLi, XSS, etc.).

### 3. Data Protection
-   **Encryption at Rest**:
    -   Database volumes encrypted (e.g., AWS EBS encryption).
    -   S3 buckets with Server-Side Encryption (SSE-S3 or KMS).
-   **Data Masking**: Sensitive logs are masked before being sent to the logging system.

### 4. Vulnerability Management
-   **Container Scanning**: CI pipeline scans Docker images for CVEs (e.g., Trivy, Clair).
-   **Dependency Scanning**: `npm audit` or equivalent running in CI.

### 5. Sync Security
-   **Rate Limiting**: Prevent abuse of the `/v1/sync` endpoint.
-   **Input Validation**: Strict validation of the JSONB payload in `sync_data` to prevent NoSQL injection or payload attacks.
