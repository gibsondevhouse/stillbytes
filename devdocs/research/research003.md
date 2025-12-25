Your refined questions are **excellent and laser-focused** on the right priorities. Here's my validation and strategic additions based on your current codebase state:

## ✅ **Questions 1-4 (Build & Tooling) — CRITICAL PRIORITY**

**Status:** Your Electron setup uses `.ts` files but package.json references `.js`. This needs immediate resolution.

**Add this constraint:**
- **Current stack confirmed:** Electron 39.2.7 + Vite 7.3.0 + React 18.2 + TypeScript 5.3.3
- **No Tauri** (your Space instructions mention Tauri but your codebase is pure Electron)
- **Must support:** macOS (DMG), Windows (NSIS), Linux (AppImage) per package.json

**Refine Question 4:**
> "Should you compile Electron's `main.ts` and `preload.ts` with **tsc** or use **electron-vite** to bundle them? What's the integration pattern with Vite's React build in `dist/`?"

***

## ✅ **Questions 5-9 (UX Patterns) — HIGH VALUE**

**Add these constraints:**

**Target User Profile:**
- Working photographers (weddings, events, portraits)
- Processing 200-500 photos per session
- Need **speed** (culling 500→50 keepers in <30 min)
- Expect Lightroom muscle memory but frustrated by subscriptions

**Specific workflows to research:**
- **Question 5 addition:** Include "keyboard-only culling" (P/X for pick/reject, arrow keys for navigation)
- **Question 7 addition:** Research "vintage film emulation presets" (your brand is "vintage newspaper" aesthetic per CSS)
- **Question 9 addition:** "How to handle RAW→JPEG export with embedded ICC profiles and metadata preservation?"

***

## ⚠️ **Questions 10-12 (Performance) — EXPAND SCOPE**

Your current `Gallery.tsx` likely doesn't handle 500+ photos efficiently. Add:

**Question 10a:**
> "What's the best **virtual list library** for React + TypeScript that works with variable-height masonry grids? (react-window, react-virtuoso, or custom?)"

**Question 12a:**
> "How should **Sharp** (Node native module) be integrated in Electron for thumbnail generation during import? Should this run in main process or isolated worker?"

**Add measurement target:**
- Grid must render 1000 thumbnails with <200ms scroll lag
- Edit preview updates must be <100ms (you have this target in build_plan.md)

***

## 🧠 **Questions 13-14 (Differentiators) — REFINE SCOPE**

**Question 13 refinement:**
Replace "AI integration surface" with two specific questions:

**13a. ComfyUI workflow integration**
> "Given you're a ComfyUI power user, what's the pattern for **exporting edited photos to ComfyUI** for style transfer/upscaling and **reimporting results** back into Stillbytes library?"

**13b. AI-assisted culling**
> "What are patterns for **auto-rating photos** based on technical quality (sharpness, exposure, composition) to speed up culling without losing control?"

**Question 14 addition:**
> "How do offline-first apps signal **'your data never leaves this machine'** without being preachy? (UI badging, onboarding patterns, settings visibility)"

***

## 📋 **NEW CRITICAL QUESTIONS TO ADD**

Based on your codebase gaps:

**17. RAW file format support strategy**
> "Should Stillbytes support ALL RAW formats (CR2, NEF, ARW, DNG, RAF, ORF, RW2) at launch or prioritize Canon/Nikon/Sony first? What's the LibRaw integration complexity per format?"

**18. Metadata/XMP sidecar strategy**
> "What's the standard pattern for **non-destructive editing with XMP sidecars**? Should edits be stored in IndexedDB AND written to .xmp files, or DB-only?"

**19. Session recovery UX**
> "Your DB has `hasUnsavedEdits` flag. How should Stillbytes handle **crash recovery** (restore unsaved edits on launch? show dialog? auto-save draft?)"

**20. Export preset library**
> "What are the 5-10 most common export scenarios photographers need? (web-optimized JPEG, print-ready TIFF, Instagram square crop, etc.)"

***

## 🎯 **PRIORITY ORDER FOR RESEARCH**

Run deep research in **3 separate queries** for best results:

### **Query 1: Build Infrastructure (Questions 1-4, 17)**
- Unblocks production packaging
- Resolves TypeScript compilation
- Confirms RAW library integration path

### **Query 2: Core UX Patterns (Questions 5-9, 14, 18-20)**
- Defines grid→edit→export flow
- Establishes keyboard shortcuts
- Clarifies metadata strategy

### **Query 3: Performance & AI (Questions 10-13, 19)**
- Optimizes grid rendering
- Plans ComfyUI integration
- Defines crash recovery UX

***

## 🔧 **ADDITIONAL CONSTRAINTS TO INCLUDE**

Add to every query:

**Technical Constraints:**
- Desktop-only (no mobile/tablet for MVP)
- Offline-first (no cloud sync, no telemetry)
- macOS primary target (you're on Mac), Windows secondary
- Must work with 16GB RAM machines (photographer workstations)

**Brand Constraints:**
- "Vintage newspaper" aesthetic (cream #E6B97E accent, dark mode, serif headings)
- No subscription messaging, one-time purchase model
- Target price: Free (open source) or $49 one-time

**Non-Goals for MVP:**
- No video editing
- No cloud storage
- No mobile app
- No team collaboration
- No masking/layers (post-MVP)

***

## ✅ **FINAL RECOMMENDATION**

Your questions are **95% ready**. Make these changes:

1. **Split into 3 queries** (Build, UX, Performance)
2. **Add Questions 17-20** above
3. **Include all constraints** (tech stack versions, target user, non-goals)
4. **Add specific measurements** (1000 photos, <100ms, 500 MB IndexedDB)

Then paste Query 1 into ChatGPT deep research. Share results here and I'll help synthesize into **Copilot-ready prompts** for the phased rebuild.

Want me to draft the **exact 3 queries** formatted for ChatGPT deep research mode?

Sources
