# Project Structure

This document provides an overview of the Mosaiq project structure, including directories and high-level descriptions of key files.

---

## Root Directory

### Files
- **`.gitignore`**: Specifies files and directories to be ignored by Git.
- **`package.json`**: Defines project metadata, dependencies, and scripts.
- **`README.md`**: Contains an overview of the project, setup instructions, and development workflow.
- **`tsconfig.json`**: TypeScript configuration for the entire project.
- **`webpack.config.js`**: Webpack configuration for bundling the application.

---

## `/docs`

Contains documentation related to the project.

### Files
- **`architecture.md`**: Describes the architectural principles and high-level design of the application.
- **`phased_migration_plan.md`**: Outlines the phased implementation plan for refactoring and feature development.
- **`project_status.md`**: Tracks the current status of the project, including implemented features and limitations.
- **`requirements.md`**: Details the system requirements and key architectural decisions.

---

## `/packages`

Contains the core packages of the monorepo.

### Subdirectories
- **`common-ui/`**: Platform-agnostic React components.
  - **`src/`**: Source code for shared UI components.
    - **`index.ts`**: Entry point for exporting components and types like `ReadingSettings`.
  - **`package.json`**: Metadata and dependencies for the `common-ui` package.
  - **`tsconfig.json`**: TypeScript configuration for the `common-ui` package.

- **`core/`**: Shared business logic and services.
  - **`src/`**: Contains core logic and utilities.
  - **`package.json`**: Metadata and dependencies for the `core` package.
  - **`tsconfig.json`**: TypeScript configuration for the `core` package.

- **`desktop-app/`**: Electron-based desktop application.
  - **`src/`**: Source code for the desktop application.
  - **`package.json`**: Metadata and dependencies for the `desktop-app` package.

- **`platform-abstractions/`**: Interfaces for platform-specific code.
  - **`src/`**: Contains platform abstraction interfaces and utilities.

---

## `/scripts`

Contains utility scripts for project maintenance.

### Files
- **`build.js`**: Script for building the project.
- **`clean.js`**: Script for cleaning up build artifacts.
- **`start.js`**: Script for starting the application in development mode.

---

## `/src`

Contains the main application source code.

### Subdirectories
- **`content/`**: Logic for content processing and extraction.
- **`data/`**: Data storage and management utilities.
- **`logic/`**: Core application logic.
- **`main/`**: Electron main process code.
- **`renderer/`**: React components for the UI.
- **`ui/`**: Shared UI components and styles.

---

## `/storage`

Contains modules for managing local content storage.

### Subdirectories
- **`content/`**: Handles storage and retrieval of content files.

---

## Key Interfaces

### `ReadingSettings` (Defined in [`index.ts`](../packages/common-ui/src/index.ts))
```typescript
interface ReadingSettings {
  fontSize: string;
  lineHeight: string;
  theme: 'light' | 'dark' | 'sepia';
  width: string;
  fontFamily: string;
}