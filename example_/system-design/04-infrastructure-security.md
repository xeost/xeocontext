# Infrastructure & Security

## Cloud Infrastructure (AWS)

Our infrastructure is designed to be cloud-agnostic but is currently modeled for AWS deployment using Terraform.

### Compute Layer
*   **EKS (Elastic Kubernetes Service)**: Manages our containerized workloads.
    *   **Node Groups**:
        *   *General Purpose*: For API and Sync services.
        *   *Memory Optimized*: For Redis and Database (if self-hosted).

### Networking
*   **VPC**: private network isolation.
*   **ALB (Application Load Balancer)**: Ingress controller handling SSL offloading.
*   **CDN (CloudFront)**: Caches static frontend assets and public files (images) closer to the user.

### Storage
*   **S3 (Simple Storage Service)**: Stores user uploads (PDFs, EPUBs, Images) encrypted at rest using KMS.
*   **RDS (Relational Database Service)**: Managed PostgreSQL with Multi-AZ for high availability.
*   **ElastiCache (Redis)**: Managed Redis cluster for session management and Pub/Sub.

## Security Architecture

### 1. Zero Trust Network
*   All pod-to-pod communication is restricted via **NetworkPolicies**.
*   The database is in a **Private Subnet**, accessible only by the API Security Group.

### 2. Authentication & Authorization
*   **JWT tokens** are signed using RS256 asynchronous cryptography.
*   **RBAC (Role-Based Access Control)** is enforced at the API Middleware level.
*   **Rate Limiting** is applied per IP at the Ingress level using Nginx/Kong.

### 3. Data Protection
*   **Encryption at Rest**: AWS KMS for EBS volumes, RDS, and S3 buckets.
*   **Encryption in Transit**: TLS 1.3 enforced for all external and internal traffic where possible.

### 4. Supply Chain Security
*   Container images are scanned for vulnerabilities (CVEs) in the CI/CD pipeline before deployment.
*   **Secret Management**: Secrets are injected via **Vault** or **AWS Secrets Manager**, never hardcoded.
