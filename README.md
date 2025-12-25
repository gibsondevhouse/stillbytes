# Stillbytes

Free, local, AI-native RAW photo editor for photographers tired of Adobe subscriptions.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Desktop:** Electron
- **Image Processing:** LibRaw (dcraw), Sharp, Canvas API + OffscreenCanvas
- **Storage:** Dexie.js (IndexedDB)
- **State:** React Context + useReducer
- **Metadata:** exiftool-vendored, XMP sidecars

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Test
npm run test
```

## Features (Current)

- **Local Discovery:** Scan local directories for photo libraries.
- **Gallery View:** Responsive grid with high-performance thumbnails and metadata display.
- **Canvas Editor:** Real-time HSL, Exposure, Brightness, and Contrast adjustments using `OffscreenCanvas`.
- **Non-Destructive:** Edits are stored as an operation stack in IndexedDB; original files remain untouched.
- **Workflow Tools:** 
  - Before/After comparison toggle.
  - Keyboard shortcuts for navigation and editing.
  - High-quality JPG export.

## Architecture

Built using an **AI-first development approach** where 100% of production code is AI-generated. The project leverages Electron for native filesystem access and Dexie.js for a robust local database.

## Project Status

- [x] **Day 1:** Project setup & boilerplate.
- [x] **Day 2-3:** Database layer (Dexie.js) & Type definitions.
- [x] **Day 4-5:** Import flow & IPC communication.
- [x] **Day 6-7:** Gallery Grid & Photo metadata cards.
- [x] **Day 8-10:** Canvas Editing Engine & Detail View.
- [x] **Polish:** Export functionality, keyboard shortcuts, and UI refinements.
- [ ] **Next:** Full-resolution RAW decoding integration (LibRaw), Advanced AI masks.

## License

MIT
