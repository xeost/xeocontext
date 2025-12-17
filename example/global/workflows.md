# System Workflows

## 1. User Registration & Onboarding
1.  User submits `POST /v1/auth/register`.
2.  Identity Service creates User and issues JWT.
3.  (Optional) Welcome email sent via Async Event (`user.created`).

## 2. Offline Mode & Sync (Library)
1.  User opens app (offline), reads PDF to page 10.
2.  Local DB stores `lastReadPage: 10`.
3.  Connection restored.
4.  App calls `POST /v1/sync` with `{ changes: [...] }`.
5.  Library Service updates Central DB.
6.  Library Service publishes `library/sync` event.
7.  User's Tablet receives event, updates local state to page 10.

## 3. Deployment Workflow (GitOps)
1.  Developer pushes code to `main`.
2.  CI builds Docker image -> `registry/app:sha`.
3.  CI updates `values.yaml` in `k8s-config` repo.
4.  ArgoCD detects change and syncs K8s cluster.
