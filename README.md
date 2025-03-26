# Mosaiq - Personal Knowledge Management

Mosaiq is a cross-platform desktop application for personal knowledge management focused on content consumption, annotation, and concept relationship discovery.

## Project Architecture

The project has been restructured into a monorepo with the following packages:

- `platform-abstractions`: Interfaces for platform-specific code
- `core`: Shared business logic that can run on any platform
- `common-ui`: Platform-agnostic React components
- `desktop-app`: Electron-based desktop application

## Architectural Principles

### Platform Abstraction

The application follows a layered architecture with clear platform abstractions using dependency injection:

1. **Interface Definitions**: Common interfaces that define contracts for platform-specific implementations
2. **Service Layer**: Business logic that depends only on interfaces, not implementations
3. **Platform Adapters**: Platform-specific implementations of interfaces

### Local-First Approach

- All data stored locally by default
- Full functionality without internet connection
- Optional cloud features as enhancement only

### Event-Driven Communication

- Components communicate via events rather than direct dependencies
- Allows for loose coupling and extensibility

## Development

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start desktop app
npm start
```

### Development Workflow

```bash
# Run in development mode
npm run dev
```

### Package Structure

- `/packages/platform-abstractions/`: Platform abstraction interfaces
- `/packages/core/`: Shared business logic and services
- `/packages/common-ui/`: Shared React components
- `/packages/desktop-app/`: Electron desktop application

## Key Interfaces

### Storage Provider

```typescript
interface IStorageProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, data: T): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}
```

### Platform Capabilities

```typescript
interface IPlatformCapabilities {
  type: 'desktop' | 'web' | 'mobile';
  hasFileSystemAccess: boolean;
  hasBackgroundProcessing: boolean;
  hasLocalAIProcessing: boolean;
  hasNativeNotifications: boolean;
  storageCapacity: number | null;
  isOnline(): Promise<boolean>;
  getPlatformInfo(): Promise<{
    os?: string;
    version?: string;
    arch?: string;
    memory?: number;
  }>;
}
```

### Content Processor

```typescript
interface IContentProcessor {
  processUrl(url: string): Promise<ProcessedContent>;
  processHtml(html: string, baseUrl?: string): Promise<ProcessedContent>;
  processFile(filePath: string): Promise<ProcessedContent>;
  extractMetadata(content: ProcessedContent): Promise<ContentMetadata>;
}
```

## Implementation Phases

The project is being implemented in phases:

1. **Phase 1 (Current)**: Architectural Restructuring
   - Monorepo structure with core packages
   - Platform abstraction interfaces
   - Platform detection utilities

2. **Phase 2**: Storage Layer Abstraction
   - Abstract filesystem operations behind interfaces
   - Create adapters for different storage backends

3. **Phase 3**: UI Component Refactoring
   - Separate platform-specific UI code
   - Create responsive component library

4. **Phase 4**: Offline-First Sync Framework
   - Implement CRDT-based data model
   - Create sync infrastructure for multi-device usage

5. **Phase 5**: Web Platform Implementation
   - Create browser-compatible storage adapters
   - Implement PWA capabilities

6. **Phase 6**: AI Processing Adaptation
   - Adapt AI layer for cross-platform use
   - Implement capability-based feature activation

7. **Phase 7**: Feature Parity and Polish
   - Ensure consistent experience across platforms
   - Optimize performance for all environments
