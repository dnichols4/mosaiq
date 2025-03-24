# Mosaiq - Knowledge & Learning Management

A cross-platform desktop application for Knowledge & Learning Management focused on content consumption, annotation, and concept relationship discovery.

## Proof of Concept

This is a simple proof of concept that implements:

- URL saving with basic content extraction
- List view of saved resources
- Local storage of content and metadata

## Features

- Save web pages for later reading
- Extract and clean up content for a better reading experience
- Store and manage your knowledge base locally

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the application:

```bash
npm run build
```

4. Start the application:

```bash
npm start
```

## Development

For development with hot reloading:

```bash
npm run dev
```

## Project Structure

- `src/main/` - Electron main process
- `src/renderer/` - React UI components
- `src/content/` - Content processing logic
- `src/data/` - Data storage and retrieval
- `storage/` - Local storage for content

## Architecture

This application follows a layered architecture with:

- UI Layer (React components)
- Application Logic Layer (State management with Zustand)
- Content Processing Layer (HTML parsing and cleanup)
- Data Management Layer (Local storage)

## Next Steps

- Implement content viewing with annotations
- Add tagging capabilities
- Implement search functionality
- Add concept extraction with AI processing
