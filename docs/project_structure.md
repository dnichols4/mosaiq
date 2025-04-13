# Mosaiq Project Structure

## Revision History
| Version | Date | Changes | 
|---------|------|---------|  
| 1.0 | 2025-03-26 | Initial document creation |
| 1.1 | 2025-04-10 | Updated to reflect current codebase |
| 1.2 | 2025-04-11 | Updated to include platform dialog and file picker components |
| 1.3 | 2025-04-11 | Updated to include vector storage and serialization components |

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
│   ├── content/       # Content processing interfaces (IContentProcessor)
│   ├── platform/      # Platform capability interfaces
│   │   ├── IPlatformCapabilities.ts  # Platform capability detection
│   │   ├── dialog/    # Dialog service interfaces (IDialogService)
│   │   └── file/      # File picker interfaces (IFilePickerService)
│   ├── storage/       # Storage abstractions
│   │   ├── IStorageProvider.ts   # Generic storage interface
│   │   └── IVectorStorage.ts     # Vector embeddings storage interface
│   ├── types/         # Common type definitions
│   ├── utils/         # Platform detection utilities
│   └── index.ts       # Package exports
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
│   ├── utils/         # Utility functions
│   │   └── serialization.ts     # Data serialization utilities
│   └── index.ts       # Package entry point
└── package.json
```

The core services implement the business rules and application logic, using the platform abstractions.

### @mosaiq/common-ui

This package contains shared UI components that can be used across different interfaces.

```
common-ui/
├── src/               # UI component source code
│   ├── components/      # React components
│   │   ├── dialog/        # Platform dialog components
│   │   │   ├── DialogContext.tsx   # Context for dialog services
│   │   │   └── PlatformDialog.tsx   # Platform-independent dialog components
│   │   ├── file/          # File picker components
│   │   │   ├── FilePickerContext.tsx   # Context for file picker services
│   │   │   └── FilePickerButton.tsx    # Buttons for selecting files
│   │   └── [other components]
│   └── index.ts         # Package exports
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
│   │   │   ├── AdapterFactory.ts             # Factory for creating platform adapters
│   │   │   ├── ElectronContentProcessor.ts   # Content processing implementation
│   │   │   ├── ElectronPlatformCapabilities.ts # Platform capabilities implementation
│   │   │   ├── ElectronStorageAdapter.ts     # Storage adapter using Electron Store
│   │   │   ├── FileSystemContentAdapter.ts   # Storage adapter using filesystem
│   │   │   ├── LocalVectorAdapter.ts         # Vector storage adapter implementation
│   │   │   ├── dialog/                       # Dialog implementation
│   │   │   │   └── ElectronDialogService.ts    # Electron-specific dialog service
│   │   │   └── file/                         # File picker implementation
│   │   │       └── ElectronFilePickerService.ts # Electron-specific file picker service
│   │   ├── ipc.ts     # IPC handler registration and routing
│   │   ├── main.ts    # Main process entry point and window management
│   │   └── preload.ts # Preload script for exposing APIs to renderer
│   └── renderer/      # Frontend React application
│       ├── components/ # Reusable UI components
│       ├── pages/     # Application pages (HomePage, ReaderPage, SettingsPage)
│       ├── providers/ # Context providers (ThemeProvider)
│       ├── services/  # Renderer-side service implementations
│       │   ├── ElectronDialogService.ts    # Dialog service implementation for renderer
│       │   └── ElectronFilePickerService.ts # File picker service for renderer
│       ├── styles/    # CSS styles
│       ├── App.tsx    # Main React component and routing
│       ├── index.html # HTML template
│       └── index.tsx  # Renderer entry point
└── package.json
```

The desktop app package uses Electron to create a desktop application, with a main process for Node.js operations and a renderer process for the UI.

## Source Code Structure

The source code is primarily organized within the packages directory. The current implementation does not heavily use the root src/ directory, as most code is contained within the packages according to their role in the architecture.

## Build System

The project uses TypeScript for type safety and is built with a combination of TypeScript's compiler (tsc) and Webpack:

1. TypeScript compiles the main process code
2. Webpack bundles the renderer process code (React application)
3. Built artifacts are placed in the `dist` directory of each package

## Application Architecture

### Main Process (Electron)

The main process (`main.ts`) is responsible for:
- Creating and managing application windows
- Setting Content Security Policy (CSP)
- Registering custom protocols
- Managing application lifecycle
- Supporting development tools

The IPC handlers (`ipc.ts`) manage communication between renderer and main processes:
- Exposing ContentService methods to the renderer
- Exposing SettingsService methods to the renderer
- Providing platform capabilities information

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
- Storage provider interface (IStorageProvider)
- Content processor interface (IContentProcessor)
- Platform capabilities interface (IPlatformCapabilities)
- Dialog service interface (IDialogService)
- File picker service interface (IFilePickerService)

These interfaces are implemented in the desktop-app package with Electron-specific adapters:
- ElectronStorageAdapter: implements IStorageProvider using Electron Store
- FileSystemContentAdapter: implements IStorageProvider using file system access
- LocalVectorAdapter: implements IVectorStorage for managing vector embeddings
- ElectronContentProcessor: implements IContentProcessor using JSDOM, Readability, and Cheerio
- ElectronPlatformCapabilities: implements IPlatformCapabilities for desktop environment
- ElectronDialogService: implements IDialogService using Electron's dialog API
- ElectronFilePickerService: implements IFilePickerService using Electron's file dialog API

## Development Workflow

1. Install dependencies: `npm install` at the root
2. Start development build: `npm run dev`
3. Build production: `npm run build`

The development mode uses watchers to automatically rebuild when files change, and launches Electron with the current build.

## Dependencies

Key dependencies include:
- Electron: For the desktop application shell
- React: For the UI
- React Context API: For dependency injection and platform service abstraction
- TypeScript: For type safety
- Zustand: For state management
- Mozilla's Readability: For content extraction
- Cheerio and JSDOM: For HTML parsing and content processing
- React Router: For navigation
- Electron Store: For persistent settings storage
- RDF libraries: For future knowledge graph implementation (N3, rdf-parse, @rdfjs/data-model)

## Adding New Features

When adding new features:
1. Determine which package should contain the feature
2. Update the relevant service interfaces in the platform abstractions
3. Implement the service in the core package if it's business logic
4. Create UI components in the common-ui package if they're reusable
5. Integrate with the desktop app if necessary

## Conclusion

The Mosaiq project follows a modular, layered architecture with clear separation of concerns. By dividing functionality into separate packages, the application maintains high cohesion within modules and loose coupling between them, making it easier to maintain and extend. The current implementation provides a solid foundation for the planned features while already offering core content management capabilities.
