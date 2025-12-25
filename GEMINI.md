# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## Project Overview

**Stillbytes** is a free, local, AI-native RAW photo editor for photographers tired of Adobe subscriptions. The project uses an **AI-first development approach** where an AI assistant generates 100% of the production code, and the human reviews and iterates.

**Tech Stack:**

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Canvas API
- Backend: Node.js + Express
- Image Processing: LibRaw (RAW decoding), Sharp (JPG/PNG/TIFF), ExifTool (metadata)
- AI: ComfyUI (local GPU-powered intelligent editing tasks)
- Desktop: Electron (macOS/Windows/Linux native app)
- File Storage: Local filesystem + XMP sidecars (no cloud lock-in)

## Building and Running

### Common Development Commands

```bash
# Install dependencies
npm install

# Start Vite dev server (frontend HMR)
npm run dev

# Build frontend for production
npm run build

# Build Electron app (macOS + Windows)
npm run electron:build

# Run all unit tests
npm run test

# Run tests in UI mode (Vitest)
npm run test:ui

# Check TypeScript without emitting
npm run type-check

# Lint with ESLint
npm run lint

# Auto-format with Prettier
npm run format
```

### Development Workflow

1. **Start dev server:** `npm run dev`
2. **Open app in browser** at http://localhost:5173
3. **Type-check continuously** in your IDE.
4. **Lint on save** is configured.
5. **Test specific file:** `npm run test -- path/to/test-file.test.ts`
6. **Before committing:** `npm run lint && npm run type-check && npm run test`

## Development Conventions

- **AI-First Code Generation:** 100% of production code is AI-generated. The development workflow is based on providing detailed prompts to an AI assistant.
- **TypeScript Strict Mode:** The project uses strict TypeScript to catch errors early.
- **React Context + Custom Hooks:** State management is handled via React Context and custom hooks.
- **Non-Destructive Editing:** Original RAW files are never modified. Edits are stored as a sequence of operations (`EditOperation`) in IndexedDB and applied in real-time.
- **Canvas Editing Engine:** The `ImageEditorService` uses `OffscreenCanvas` and direct pixel manipulation for high-performance filter application. Web-based adjustments (HSL, Exposure) are calculated using efficient pixel traversals to maintain <100ms response times.
- **Testing:** The project uses Vitest for unit tests. The testing strategy includes unit, integration, and end-to-end tests.
- **CI/CD:** GitHub Actions are configured for continuous integration and deployment, including building, testing, and releasing the application.

## Key Documentation

- **PERPLEXITY.md:** The full vision document for the project, including product philosophy, features, and roadmap.
- **CLAUDE.md:** Provides guidance to the Claude AI when working on the project.
- **devdocs/build_plan.md:** A detailed, AI-first development workflow with specific prompts for the AI assistant.
- **devdocs/github-vscode-config.md:** Details the CI/CD setup with GitHub Actions and the recommended VSCode configuration for the project.
