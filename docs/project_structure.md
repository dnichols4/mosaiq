# Mosaiq Project Structure

## Overview

Mosaiq is a cross-platform desktop application for Knowledge & Learning Management focused on content consumption, annotation, and concept relationship discovery. The architecture follows a modular, local-first approach prioritizing user privacy and offline functionality.

This document provides a comprehensive overview of the project structure to help developers understand how different components work together.

## Project Organization

The project is organized as a monorepo using npm workspaces. The primary directories are:

```
mosaiq/
├── docs/                       # Project documentation
├── packages/                   # Core packages (npm workspaces)
│   ├── common-ui/              # Shared UI components
│   ├── core/                   # Core business logic
│   ├── desktop-app/            # Electron desktop application
│   └── platform-abstractions/  # Platform abstraction layer
├── scripts/                    # Build and utility scripts
├── src/                        # Main source code
└── storage/                    # Local storage directory
```

## Key Files (Root)

- **package.json**: Root package with workspace configuration and shared dev dependencies
- **tsconfig.json**: Base TypeScript configuration
- **webpack.config.js**: Webpack build configuration
- **build.js**: Build script for the entire application
- **start.js**: Script to start the application

## Packages

The project is divided into several packages to maintain separation of concerns:

### @mosaiq/platform-abstractions

The platform abstractions package provides interfaces and types for platform-specific functionality. This ensures that the core business logic can operate independently of the platform it's running on.

```
platform-abstractions/
├── src/
│   ├── content/       # Content processing abstractions
│   ├── platform/      # OS and platform APIs
│   ├── storage/       # Storage abstractions
│   ├── types/         # Common type definitions
│   └── utils/         # Shared utilities
└── package.json
```

This package defines interfaces for file system access, content processing, and other platform-specific operations.

### @mosaiq/core

The core package contains the business logic for the application, independent of the UI or platform.

```
core/
├── src/
│   ├── services/      # Core services
│   │   ├── ContentService.ts    # Service for managing content processing
│   │   └── SettingsService.ts   # Service for application settings
│   └── index.ts       # Package entry point
└── package.json
```

The core services implement the business rules and application logic, using the platform abstractions.

### @mosaiq/common-ui

This package contains shared UI components that can be used across different interfaces.

```
common-ui/
├── src/               # UI component source code
├── copyStyles.js      # Helper for copying CSS files
└── package.json
```

Shared UI components maintain a consistent look and feel across the application.

### @mosaiq/desktop-app

The desktop application package integrates the core logic with Electron to create a desktop application.

```
desktop-app/
├── src/
│   ├── main/          # Electron main process code
│   │   ├── adapters/  # Platform-specific adapters
│   │   ├── ipc.ts     # IPC handler setup
│   │   ├── main.ts    # Main process entry
│   │   └── preload.ts # Preload script for renderer process
│   └── renderer/      # Frontend React application
│       ├── pages/     # Application pages
│       ├── providers/ # Context providers
│       ├── styles/    # CSS styles
│       ├── App.tsx    # Main React component
│       ├── index.html # HTML template
│       └── index.tsx  # Renderer entry point
└── package.json
```

The desktop app package uses Electron to create a desktop application, with a main process for Node.js operations and a renderer process for the UI.

## Main Source Code Structure

The main source code directory contains shared components and code that might be used across packages:

```
src/
├── content/           # Content processing logic
├── data/              # Data management components
├── logic/             # Shared business logic
├── main/              # Main process-related code
├── renderer/          # Renderer process components
└── ui/                # UI-related code
```

## Build System

The project uses TypeScript for type safety and is built with a combination of TypeScript's compiler (tsc) and Webpack:

1. TypeScript compiles the main process code
2. Webpack bundles the renderer process code (React application)
3. Built artifacts are placed in the `dist` directory of each package

## Application Architecture

### Main Process (Electron)

The main process (`main.ts`) is responsible for:
- Creating and managing application windows
- Registering IPC handlers for renderer-to-main communication
- Managing application lifecycle
- Handling platform-specific functionality

### Renderer Process (React)

The renderer process (`index.tsx`, `App.tsx`) contains:
- React components for the UI
- State management using Zustand
- Routing with React Router
- Communication with the main process via IPC

### Core Services

Core services in the `@mosaiq/core` package implement the main application logic:
- ContentService: Manages content processing and transformation
- SettingsService: Handles application settings and preferences

### Platform Abstraction

The platform abstraction layer in `@mosaiq/platform-abstractions` ensures that the core business logic can run on any platform by providing:
- File system abstractions
- Platform-specific API abstractions
- Storage abstractions

## Development Workflow

1. Install dependencies: `npm install` at the root
2. Start development build: `npm run dev`
3. Build production: `npm run build`

The development mode uses watchers to automatically rebuild when files change, and launches Electron with the current build.

## Dependencies

Key dependencies include:
- Electron: For the desktop application shell
- React: For the UI
- TypeScript: For type safety
- Zustand: For state management
- Cheerio and JSDOM: For HTML parsing and content processing
- React Router: For navigation

## Adding New Features

When adding new features:
1. Determine which package should contain the feature
2. Update the relevant service interfaces in the platform abstractions
3. Implement the service in the core package if it's business logic
4. Create UI components in the common-ui package if they're reusable
5. Integrate with the desktop app if necessary

## Conclusion

The Mosaiq project follows a modular, layered architecture with clear separation of concerns. By dividing functionality into separate packages, the application maintains high cohesion within modules and loose coupling between them, making it easier to maintain and extend.
