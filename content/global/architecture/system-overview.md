---
title: System Overview
description: High-level vision, core backend responsibilities, and technology stack.
---

## Overview

XeoDocs is a platform designed for the orchestration and lifecycle management of open-source documentation translation. The system combines a centralized architecture for state control with a local Command Line Interface (CLI) tool to facilitate Artificial Intelligence (IA) assisted translation workflows, ensuring a clean and synchronized version history.

## Core System Responsibilities (Backend)

The core of the system, hosted on the server, handles the following critical responsibilities:

### Project Management
- Registration and configuration of metadata (name, slug, source repository, source domain).
- Orchestration of the initial forking into the organization's account (GitHub/GitLab).
- The fork repository must use the project slug as its name, not the original repository name.
- Projects must support including paths to be ignored, using a format similar to `.gitignore`.

### Language Management
- Registration and configuration of target languages for each Project.
- Each language is published on a different domain (stored for informational purposes).
- Creation of initial `local-[lang_code]` and `[lang_code]` branches for the language.

### Monitoring and Synchronization (Upstream Sync)
- Continuous monitoring of the main branch (`main` or configured) of the original repository (upstream).
- Automatic synchronization of the `main` branch of the XeoDocs fork to keep it identical to the original.
- **Diff Analysis:** Comparison of versions to identify created, modified, or deleted files.
- **State Management:** Recording in the database (PostgreSQL) which files require attention (pending translation, outdated, etc.).

## Technology Stack

### Local Environment (Translator)
- **XeoDocs-CLI:** CLI application in Go (compiled binary).
- **Editor:** Windsurf or Cursor.
- **Git:** Standard Git client.

### Backend & Infrastructure
- **Core:** Go (Modular Monolith).
- **Database:** PostgreSQL (Supabase) - Stores users, projects, configuration, and synchronization state of each file.
- **Hosting:** Docker Swarm on VPS.
- **Email Notifications:** Resend.

### Frontend
- **Public Site:** Next.js (SSG/SSR).
- **Admin Panel:** Next.js + Tauri (Desktop).
- **Communication API:** REST (consumed by Frontend and CLI).

### Development Environment
- **Public Site:** Next.js development tools.
- **Admin Panel:** Next.js and Tauri development tools.
- **Backend and Database:** Docker Compose on Docker Desktop.
- **GitHub:** The same GitHub account as production, but fork names will have a prefix [`staging-` | `dev-`] depending on the environment, distinguishing them from production forks which have no prefix.
