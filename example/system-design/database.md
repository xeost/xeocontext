# Database Schema

## Users Table
- id: UUID
- email: VARCHAR
- password_hash: VARCHAR

## Posts Table
- id: UUID
- user_id: UUID
- content: TEXT
