# ExampleApp System Design

Welcome to the System Design repository for **ExampleApp**, a Local-First TODOs, Notes, and Library application.

## Architecture Overview

This system follows a **Domain-Driven Design (DDD)** approach, split into the following domains:

-   **[Identity](/domains/identity)**: User management and authentication.
-   **[Todos](/domains/todos)**: Task management.
-   **[Notes](/domains/notes)**: Rich text notes.
-   **[Library](/domains/library)**: File management and **Local-First Synchronization**.

## System Docs

-   **[Infrastructure & High Availability](/global/infrastructure)**: K8s architecture, scaling strategies.
-   **[Database Schema](/global/database)**: ERD and usage.
-   **[Security](/global/security)**: Auth protocols, data protection.
-   **[Workflows](/global/workflows)**: Key system processes.

## API Specifications

This repository contains the authoritative API definitions:

-   **Rest API (OpenAPI)**: Aggregated at [Global Gateway](/global/gateway/openapi.yaml).
-   **Event API (AsyncAPI)**: Aggregated at [Global Gateway](/global/gateway/asyncapi.yaml).

## Synchronization Strategy

The core feature of ExampleApp is its **Local-First** capability for the Library domain. It allows users to read and manage files offline, syncing state (bookmarks, last page read) across devices when online via an Optimistic UI model.
