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

## Architecture

Built using an **AI-first development approach** where 100% of production code is AI-generated. See `devdocs/` for comprehensive research and build plans.

## Project Status

✅ Day 1: Project setup complete  
⏳ Day 2-3: Database layer (IndexedDB + Dexie.js)  
⏳ Days 4-25: See `devdocs/build_plan.md`

## License

MIT
