# Stillbytes Pre-Development Research Round 2: MEDIUM Priority

---

## INSTRUCTIONS FOR PERPLEXITY AI

**Task:** Read this entire document carefully, then create a comprehensive research report for MEDIUM priority items.

**Output File:** `/Users/gibdevlite/dev-team/projects/stillbytes/devdocs/research/research002.md`

**Context from Round 1:**
- ✅ HIGH priority complete (LibRaw, Sharp, Canvas, HSL, Tone Curves, Clipping, Filter Pipeline, Memory, Web Workers)
- ✅ Core tech stack decisions locked in (see research001.md)
- 🎯 NOW: Research metadata handling, storage, Electron integration, state management

**Instructions:**
1. Read all sections below (1.2-1.4, 2.3-2.4) and identify all research items marked with [ ]
2. For each research item, conduct thorough investigation using your web search capabilities
3. Reference decisions from research001.md where applicable (e.g., "Given we're using Sharp for export...")
4. Compile findings into research002.md organized by the same section structure
5. For each research topic, provide:
   - **Summary:** 2-3 sentence overview of findings
   - **Key Resources:** Links to official docs, GitHub repos, tutorials
   - **Code Examples:** TypeScript/JavaScript snippets for Electron/Node.js context
   - **Recommendations:** Best approach for Stillbytes (prefer simplicity over complexity)
   - **Risks/Limitations:** Gotchas, performance concerns, cross-platform issues
   - **Integration Points:** How this connects to Round 1 decisions
6. Save the completed research to: `devdocs/research/research002.md`
7. Format using Markdown with clear headers matching the structure below

**Priority Order for This Round:**
- CRITICAL: Section 1.3 (IndexedDB - core to MVP), 1.4 (Electron IPC - security risk)
- HIGH: Section 1.2 (ExifTool, XMP - user data), 2.3 (Undo/redo - UX critical)
- MEDIUM: Section 2.4 (React Context - performance nice-to-have)

Begin research after reading this complete document.

---

**Purpose:** MEDIUM priority research for metadata, storage, Electron integration, and state management.

**Status:** Round 2 Research  
**Dependencies:** Requires research001.md completion  
**Target Completion:** Before Day 1 of build  
**Owner:** Conductor + AI Research Agents

---

## 1.2 METADATA & FILE FORMATS

### 1.2.1 ExifTool Integration ✅ COMPLETE
- [x] **ExifTool Node.js Wrapper**
  - Research: exiftool-vendored vs exiftool.js vs subprocess
  - **DECISION:** exiftool-vendored (5.4ms/file, TypeScript support, maxProcs: 8)
  - Questions:
    - Which wrapper has best TypeScript support? ✅ exiftool-vendored only option
    - Extract EXIF without decoding full RAW (performance)? ✅ Extract from TIFF post-LibRaw
    - Parse camera-specific metadata (lens corrections, focal length, f-stop)? ✅ 6000+ tags supported
    - Batch extraction: 1000 files metadata extraction time? ✅ ~5 seconds @ maxProcs:8
    - Error handling for files with corrupted EXIF? ✅ tags.errors[] handling
  - Integration: Works with LibRaw/Sharp pipeline from research001.md
  - Deliverable: Metadata schema (TypeScript interfaces) + extraction script ✅

- [x] **EXIF Metadata Schema Design**
  - Research: Essential vs nice-to-have EXIF tags for photographers
  - **DECISION:** Core tags in Photo interface, extended tags optional
  - Questions:
    - Core tags: Camera, Lens, ISO, Shutter, Aperture, Focal Length, Date? ✅ All included
    - Extended tags: GPS, Color Space, Copyright, Keywords? ✅ Optional via (tags as any)
    - How to display in UI (sidebar panel)? ✅ Photo interface ready
    - Search/filter by EXIF values (e.g., "ISO > 3200")? ✅ IndexedDB indexes
  - Deliverable: Photo interface with EXIF properties ✅

### 1.2.2 XMP Sidecar Specification ✅ COMPLETE
- [x] **XMP Format for Edit History**
  - Research: Adobe XMP spec, Lightroom develop settings format
  - **DECISION:** Use crs: namespace (Camera Raw Schema), operations not pixels
  - Questions:
    - XMP namespace for Stillbytes edits (custom vs standard)? ✅ crs: for Lightroom compat
    - How Lightroom stores HSL adjustments in XMP? ✅ crs:SaturationAdjustmentRed, etc.
    - Store operation stack or final values? ✅ Operations (reversible)
    - XMP file naming convention (photo.CR2 → photo.xmp)? ✅ Same basename
    - Round-trip compatibility: Stillbytes → Lightroom → Stillbytes? ✅ Test required
  - Deliverable: XMP template for Stillbytes EditOperation[] ✅

- [x] **XMP Read/Write Libraries**
  - Research: Node.js XMP libraries (xmldom, fast-xml-parser, adobe-xmp-core)
  - **DECISION:** Use exiftool subprocess for XMP injection (proven)
  - Questions:
    - Which library supports XMP namespaces? ✅ exiftool handles all
    - Parse XMP from TIFF/JPEG metadata? ✅ exiftool reads embedded XMP
    - Write XMP sidecars without corrupting existing data? ✅ -overwrite_original flag
    - Performance: 100 XMP sidecars read/write time? ✅ Fast (fs write + exiftool)
  - Deliverable: XMP service (read, write, merge) ✅

### 1.2.3 Lightroom/Capture One Compatibility ⏸️ DEFERRED TO PHASE 2
- [ ] **Preset Import/Export**
  - Research: Import .lrtemplate, .xmp, .cube (LUT) files
  - **DECISION:** XMP sidecar generation (MVP) sufficient; preset import Phase 2
  - Questions:
    - Parse Lightroom preset format? ⏸️ Phase 2 (Lua interpreter needed)
    - Map Lightroom sliders to Stillbytes equivalents? ⏸️ Phase 2
    - Export Stillbytes presets to Lightroom-compatible XMP? ✅ Covered by 1.2.2
    - Handle unsupported features gracefully (local adjustments)? ⏸️ Phase 2
  - Deliverable: Preset importer/exporter service ⏸️ Phase 2

---

## 1.3 STORAGE & DATABASE (CRITICAL) ✅ COMPLETE

### 1.3.1 IndexedDB Best Practices ✅ COMPLETE
- [x] **Dexie.js vs Native IndexedDB**
  - Research: Dexie.js benefits, learning curve, bundle size
  - **DECISION:** Dexie.js for MVP (2-3× faster, TypeScript support)
  - Questions:
    - Dexie.js TypeScript support? ✅ Excellent (Table<T> generic types)
    - Query performance vs native IndexedDB? ✅ 2-3× faster (request batching)
    - Transaction patterns for bulk import (100 photos)? ✅ bulkAdd() optimized
    - Schema versioning and migrations? ✅ Declarative, auto-migration
    - Error handling for quota exceeded? ✅ Try-catch + quota monitoring
  - Deliverable: Database service architecture decision ✅

- [x] **Schema Design for Photo Library**
  - Research: Best practices for storing photo metadata + thumbnails
  - **DECISION:** Photos table with exif, editHistory[], thumbnail blob
  - Questions:
    - Store full-res images or thumbnails only? (Given research001: preview-only) ✅ Thumbnails (150x100px ~20KB)
    - Schema: Libraries table, Photos table, EditHistory table? ✅ Photos + EditOperation inline
    - Index on: date, rating, camera, ISO, file path? ✅ filePath (unique), dateTaken, rating, starred
    - Blob storage: Base64 vs ArrayBuffer for thumbnails? ✅ Base64 JPEG (simpler)
    - Relationships: one library → many photos? ✅ Single Photos table for MVP
  - Deliverable: Complete database schema with indexes ✅

- [x] **Quota Management**
  - Research: IndexedDB quota limits (Chrome, Firefox, Safari)
  - **DECISION:** Monitor at 80%, request persistent at 50%, cleanup old thumbnails
  - Questions:
    - Default quota per origin? ✅ ~50GB Chrome, 2GB Firefox, 50MB Safari private
    - Detect when approaching quota (warn at 80%)? ✅ navigator.storage.estimate()
    - Request persistent storage (navigator.storage.persist())? ✅ Yes, at 50% usage
    - Cleanup strategy: delete old thumbnails, compress, archive? ✅ Delete oldest imports
    - User-facing quota display ("Library using 2.3GB / 5GB")? ✅ UI component ready
  - Deliverable: Quota monitoring service ✅

- [x] **Backup & Export**
  - Research: Export IndexedDB to JSON or portable format
  - **DECISION:** JSON export for MVP, .zip with XMP sidecars Phase 2
  - Questions:
    - Export entire library to .zip (photos + metadata + XMP)? ⏸️ Phase 2
    - Import from backup without overwriting existing library? ✅ JSON import ready
    - Sync between devices (future cloud plugin prep)? ✅ JSON format cloud-friendly
    - Incremental backup (changed photos only)? ⏸️ Phase 2
  - Deliverable: Backup/restore service spec ✅

### 1.3.2 SQLite vs IndexedDB Decision ✅ COMPLETE
- [x] **When to Use SQLite (Electron)**
  - Research: better-sqlite3, performance vs IndexedDB
  - **DECISION:** IndexedDB for MVP (<5K photos); SQLite Phase 2 for FTS5
  - Questions:
    - SQLite faster for 10,000+ photo libraries? ✅ Yes (35% faster), but MVP <5K
    - Full-text search performance (LIKE vs FTS5)? ✅ FTS5 50× faster (Phase 2)
    - File locking for concurrent access? ✅ SQLite has built-in locking
    - Cross-platform: works on macOS/Windows/Linux? ✅ Yes (better-sqlite3)
    - Migration path: IndexedDB (browser) → SQLite (Electron)? ✅ JSON export/import
  - Deliverable: Decision matrix + migration strategy if needed ✅

- [x] **Hybrid Approach Feasibility**
  - Research: Use SQLite for metadata, IndexedDB for thumbnails
  - **DECISION:** Not needed for MVP; revisit if >10K photos
  - Questions:
    - Complexity vs benefit? ✅ Too complex for MVP gains
    - Keep both in sync (transaction boundaries)? ✅ Challenging, not worth it
    - When does this make sense (>10K photos)? ✅ Phase 2 optimization only
  - Deliverable: Hybrid architecture pros/cons ✅

---

## 1.4 ELECTRON & DESKTOP INTEGRATION (CRITICAL) ✅ COMPLETE

### 1.4.1 Electron IPC Security Patterns ✅ COMPLETE
- [x] **Context Isolation & Preload Scripts**
  - Research: Secure IPC between main and renderer processes
  - **DECISION:** contextIsolation: true + preload whitelist via contextBridge
  - Questions:
    - Enable contextIsolation + nodeIntegration:false (best practice)? ✅ Yes, default Electron 12+
    - Preload script: expose minimal API surface (whitelist only)? ✅ contextBridge whitelist pattern
    - Validate all IPC messages (schema validation)? ✅ Path normalization + type checks
    - Prevent prototype pollution attacks? ✅ Object.freeze() on exposed APIs
    - TypeScript types for IPC messages? ✅ Type-safe IPC interfaces
  - Integration: File import from research001.md (8-file batch, explicit GC)
  - Deliverable: Secure IPC architecture + code examples ✅

- [x] **IPC Message Patterns**
  - Research: Request/response, pub/sub, streaming patterns
  - **DECISION:** ipcRenderer.invoke() for request-response, progress events
  - Questions:
    - Use ipcRenderer.invoke() for async responses? ✅ Yes (Promise-based)
    - Handle IPC errors gracefully (timeout, rejection)? ✅ Try-catch on renderer
    - Progress updates for long operations (RAW import)? ✅ IPC events per file
    - Cancel in-flight requests? ✅ AbortController pattern
  - Deliverable: IPC service wrapper with TypeScript types ✅

### 1.4.2 File System Access Patterns ✅ COMPLETE
- [x] **Secure File Operations**
  - Research: Read/write without compromising security
  - **DECISION:** dialog API + fs.promises + progress IPC events
  - Questions:
    - Native file dialogs (folder picker, save dialog)? ✅ dialog.showOpenDialog()
    - Copy 5GB RAW folder to ~/Stillbytes without blocking? ✅ fs.cp() async in main
    - Watch import folder for new files (tethered shooting prep)? ✅ fs.watch() (Phase 2)
    - Permissions on macOS (sandboxing, user data folder)? ✅ app.getPath('userData')
    - Windows UAC handling? ✅ Standard user folder access (no admin)
  - Deliverable: File operation service (read, write, copy, watch) ✅

- [x] **Drag-Drop Integration**
  - Research: Drag RAW files from Finder/Explorer into app
  - **DECISION:** e.preventDefault() + IPC file path extraction
  - Questions:
    - Prevent default browser drag-drop (security)? ✅ e.preventDefault() on dragover
    - Extract file paths from DataTransfer? ✅ e.dataTransfer.files (renderer → IPC)
    - Handle folders vs individual files? ✅ Check file.type === '' for folders
    - Progress indicator during copy? ✅ IPC progress events
  - Deliverable: Drag-drop handler component ✅

### 1.4.3 Electron Performance & Packaging ⏸️ PARTIAL (MVP SCOPED)
- [x] **Build & Distribution**
  - Research: electron-builder vs electron-forge
  - **DECISION:** electron-builder (simpler config, CI/CD ready)
  - Questions:
    - Which tool simplifies DMG/EXE/AppImage builds? ✅ electron-builder
    - Auto-update setup (electron-updater)? ⏸️ Phase 2 (post-MVP)
    - Code signing for macOS/Windows? ⏸️ Phase 2 (beta can be unsigned)
    - Bundle size optimization (<200MB)? ✅ Target confirmed
    - Include dcraw binary in package? ✅ Yes (extraResources)
  - Deliverable: electron-builder config + CI/CD integration ✅

- [x] **Startup Performance**
  - Research: Fast cold start (<3 seconds)
  - **DECISION:** Show UI immediately, defer DB init, lazy-load components
  - Questions:
    - Lazy-load React components? ✅ React.lazy() for heavy components
    - Defer database initialization? ✅ Init on first library open
    - Show splash screen during load? ✅ Optional (fast enough without)
    - Bundle vs asar for faster file access? ✅ asar default (faster)
  - Deliverable: Startup optimization checklist ✅

---

## 2.3 UNDO/REDO & STATE MANAGEMENT (HIGH) ✅ COMPLETE

### 2.3.1 Edit History Patterns ✅ COMPLETE
- [x] **Command Pattern Implementation**
  - Research: Command pattern for undo/redo in React
  - **DECISION:** useReducer + past/present/future arrays, operations only
  - Questions:
    - Store full image state or just operations (EditOperation[])? ✅ Operations only (5MB vs 500MB)
    - Memory limit for undo stack (last 50 operations)? ✅ 50 op limit, prune oldest
    - Serialize to IndexedDB for session recovery? ✅ JSON.stringify(operations)
    - Implement redo stack separately or derive from history? ✅ future[] array
    - How to batch operations (e.g., dragging slider = 1 undo step)? ✅ Debounce 200ms
  - Integration: HSL/tone curve operations from research001.md
  - Deliverable: useEditing hook design doc ✅

- [x] **Operation Serialization**
  - Research: Serialize operations to JSON for storage
  - **DECISION:** Type-safe EditOperation union types, JSON serializable
  - Questions:
    - Operation types: HSLAdjust, BrightnessAdjust, ToneCurve, etc.? ✅ Defined in types
    - Store operation parameters (hue: +10, saturation: +20)? ✅ parameters: Record<string, number>
    - Replay operations on different photos (apply preset)? ✅ Apply operations[] to new photo
    - Versioning for operation format (future compatibility)? ✅ version field in operation
  - Deliverable: EditOperation TypeScript interfaces ✅

### 2.3.2 Undo/Redo UI Patterns ✅ COMPLETE
- [x] **Keyboard Shortcuts**
  - Research: Standard shortcuts (Cmd+Z, Cmd+Shift+Z)
  - **DECISION:** useEffect + keydown listener, guard for text inputs
  - Questions:
    - React hook for keyboard events (react-hotkeys-hook)? ✅ Native useEffect sufficient
    - Prevent conflicts with browser shortcuts? ✅ e.preventDefault() when valid
    - Display undo history timeline (Photoshop-style)? ⏸️ Phase 2 (nice-to-have)
    - Undo/redo buttons with tooltip (show last operation)? ✅ Tooltip ready
  - Deliverable: Keyboard shortcut system ✅

- [x] **Session Recovery**
  - Research: Recover unsaved edits after crash
  - **DECISION:** 30s auto-save to sessionStorage + IndexedDB
  - Questions:
    - Auto-save edit stack to IndexedDB every 30s? ✅ setInterval(30000)
    - Detect unexpected shutdown (window.beforeunload)? ✅ Save on beforeunload
    - Prompt "Restore previous session?" on startup? ✅ Check sessionStorage
    - Clear recovered edits after successful export? ✅ clearRecovery() on export
  - Deliverable: Session recovery service ✅

---

## 2.4 REACT CONTEXT PERFORMANCE (MEDIUM) ✅ COMPLETE

### 2.4.1 Context Optimization ✅ COMPLETE
- [x] **Avoiding Re-render Hell**
  - Research: Context performance with large photo libraries
  - **DECISION:** Split contexts (PhotoContext + EditContext), React.memo() gallery
  - Questions:
    - Single PhotoContext or split (LibraryContext, EditContext)? ✅ Split (edit local)
    - Use React.memo() for Gallery items? ✅ Yes, critical for performance
    - useContextSelector or Zustand for selective subscriptions? ✅ Zustand Phase 2
    - Measure re-renders with React DevTools Profiler? ✅ Profile before optimizing
    - Virtualized list for 1000+ photos (react-window)? ⏸️ Phase 2 (if >5K photos)
  - Deliverable: Context architecture decision ✅

- [x] **State Management Alternatives**
  - Research: Zustand, Jotai, Recoil vs Context API
  - **DECISION:** Context for MVP (<5K photos), migrate to Zustand if >10K
  - Questions:
    - When is Context API sufficient (<500 photos)? ✅ Sufficient for <5K with optimization
    - Zustand benefits: simpler API, better performance? ✅ 99% improvement (3ms vs 370ms @ 10K)
    - Learning curve vs bundle size? ✅ Small curve, ~3KB bundle
    - Integration with IndexedDB (persist middleware)? ✅ Zustand persist available
  - Deliverable: State management decision matrix ✅

### 2.4.2 Optimistic Updates ✅ COMPLETE
- [x] **Immediate UI Feedback**
  - Research: Optimistic updates for editing operations
  - **DECISION:** Apply to preview immediately, debounce worker updates
  - Questions:
    - Update canvas preview before worker finishes? ✅ Yes, instant local render
    - Show stale data with loading indicator? ✅ Optional spinner for worker
    - Rollback on error (e.g., out of memory)? ✅ Catch worker error, revert
    - Debounce rapid slider changes (16ms)? ✅ 200ms debounce for worker
  - Deliverable: Optimistic update patterns ✅

---

## INTEGRATION CHECKLIST

After completing research002.md, verify integration with research001.md:

- [ ] **ExifTool** extracts metadata from LibRaw-decoded TIFF
- [ ] **XMP sidecars** store edit history (HSL, tone curves from research001)
- [ ] **IndexedDB** stores metadata + preview thumbnails (150MB from research001)
- [ ] **Electron IPC** handles RAW import (8-file batch, explicit GC from research001)
- [ ] **File operations** copy RAW files without blocking UI
- [ ] **Undo/redo** stack stores EditOperations (composable filters from research001)
- [ ] **React Context** manages photo selection + edit state
- [ ] **Session recovery** restores unsaved edits from IndexedDB

---

## DELIVERABLES FOR RESEARCH002.MD

1. **Decision Matrix:** ExifTool wrapper choice, IndexedDB vs SQLite, electron-builder config
2. **Code Examples:** IPC message patterns, XMP read/write, undo/redo hook
3. **Schema Definitions:** Photo interface with EXIF, EditOperation types, IndexedDB schema
4. **Integration Notes:** How each component connects to research001 tech stack
5. **Risk Assessment:** Security (IPC), performance (Context re-renders), data loss (quota)

---

## COMPLETION CRITERIA

This research round is complete when:

✅ All [ ] checkboxes in sections 1.2-1.4, 2.3-2.4 are checked  
✅ research002.md file created in `devdocs/research/`  
✅ All code examples are TypeScript with proper types  
✅ Integration points with research001.md are explicit  
✅ Decision matrices provided for key choices (storage, state management, Electron tools)  
✅ Security concerns addressed (Electron IPC, XMP parsing)  
✅ Performance benchmarks provided (EXIF extraction, IndexedDB queries, Context re-renders)

**Estimated Research Time:** 6-8 hours  
**Owner:** Perplexity AI + Conductor review  
**Deadline:** Before Phase 1 Day 1 (setup day)

---

**Next Action for Perplexity:** Begin research on CRITICAL items first (IndexedDB, Electron IPC), then HIGH (ExifTool, XMP, Undo/redo), then MEDIUM (React Context optimization).
