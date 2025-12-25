# Phase 2: High-Performance Core & Local AI Integration

**Objective:** Transform Stillbytes from a functional MVP into a "Lightroom-class" editor by implementing a multi-tier preview architecture and integrating a local ComfyUI backend for AI masking and generation.

**Based on Research:**

- `local_ai_perf_research.md` (AI Architecture, SAM, SDXL, LaMa)
- `lr_perf_research.md` (Preview Caching, Hybrid Pipeline, SQLite Strategy)

---

## 2.1 Core Performance Architecture ("The Lightroom Standard")

**Goal:** Instant library browsing and fluid 60FPS slider adjustments, independent of RAW file size.

### 2.1.1 Multi-Tier Preview Cache

Instead of reading RAW files or generating thumbnails on the fly, we will implement a persistent disk cache managed by **background processes**.

- **Storage Structure:**
  - Directory: `AppData/Stillbytes/Cache/{First2CharsOfHash}/{FileHash}/`
  - Files:
    - `thumb.jpg` (360px long edge, Q60) - For Grid/Filmstrip.
    - `preview.jpg` (1920px long edge, Q80) - For "Fit" view in Gallery/Editor.
    - `smart_proxy.jpg` (2560px, Q90) - For editing input (Canvas source).
    - `full.dat` (Optional 1:1 RAW buffer, LRU cached in RAM).
    - `masks/` (Subdirectory for persistent mask sidecar files - **Option A**).

- **Implementation Steps:**
  1. **Update Import Pipeline:**
      - Modify `ImportDialog` (or main process handler) to generate these 3 artifacts in parallel using `sharp` in a background worker.
      - **Virtual Copies:** Every file automatically receives a "Virtual Copy" (Version 1) upon import.
      - **Workflow Rule:** Stillbytes will only and specifically work on Virtual Copies. The original Master record remains the source of truth for the RAW file.
      - Store paths in the Database (`Photo` and `VirtualCopy` records).
  2. **Update Gallery UI:**
      - Load `thumb.jpg` by default for Virtual Copies.
  3. **Update Editor UI:**
      - Load `smart_proxy.jpg` into the WebGL/Canvas Editor.
      - **Zoom Logic:** When user zooms > 50%, async load the full RAW/High-Res tile from a background cache manager.

### 2.1.2 Hybrid Rendering Pipeline (Refinement)

Ensure the `useCanvasEditor` hook is optimized for the "Game Loop" approach.

- **Optimization:**
  - **WebGL Shader Implementation (using `regl`):** Use the `regl` library for a declarative, high-performance WebGL pipeline for Exposure, HSL, and Curves.
  - **Debounced High-Res Render:**
    - *Interaction (MouseDown):* Render using `smart_proxy.jpg` on WebGL via `regl` (Instant).
    - *Idle (MouseUp + 500ms):* Apply edits to full-resolution pipeline for export/1:1 view.

---

## 2.2 The AI Orchestrator (ComfyUI Bridge)

**Goal:** Establish a stable, robust connection between Electron and a local ComfyUI instance.

### 2.2.1 Architecture

- **Backend:** **User-Managed** ComfyUI (User provides path to their local install in Settings).
- **Communication:** HTTP (Task submission) + WebSocket (Progress streaming).
- **Orchestrator (Node.js/Electron Main):**
  - Manages ComfyUI process (Connect/Status).
  - Queues requests (One at a time to prevent VRAM OOM).
  - Handles Model Swapping (e.g., Unload SDXL before loading SAM).

### 2.2.2 The `AIClient` Service

Create `src/services/ai/comfyClient.ts`:

- `connect()`: Handshake with user's ComfyUI.
- `queueWorkflow(workflowGraph)`: Submit JSON workflow.
- `onProgress(callback)`: Listen to WS events (`execution_start`, `progress`, `execution_done`).
- `getOutput(filename)`: Retrieve generated masks/images.

### 2.2.3 Model Management UI

- A settings page to verify required models in the user's ComfyUI instance:
  - **Masking:** `SAM-ViT-B` or `MobileSAM`.
  - **Inpainting:** `LaMa` (fast removal) or `SDXL Lightning` (generative).
  - **Style:** `IP-Adapter`.

---

## 2.3 Feature: AI Masking ("Select Subject/Sky")

**Goal:** One-click selection using Segment Anything (SAM).

- **Workflow:**
  1. **User Action:** Click "Select Subject" in Editor.
  2. **Process:**
      - Electron uploads `smart_proxy.jpg` to ComfyUI.
      - Sends "SAM Predict" workflow.
  3. **Result:**
      - ComfyUI returns a B&W Mask Image.
      - Electron saves mask as a **sidecar file** in the cache folder.
      - Loads Mask into a new `MaskLayer` in the Canvas Editor.
  4. **UI:**
      - Overlay mask as red tint (50% opacity).
      - Allow user to apply HSL/Exposure *only* to masked area in the `regl` pipeline.

---

## 2.4 Feature: Content-Aware Remove (LaMa)

**Goal:** Magic Eraser functionality.

- **Workflow:**
  1. **User Action:** Brush over an unwanted object (creates a white mask on top of photo).
  2. **Process:**
      - Electron sends Photo + Mask to ComfyUI.
      - Executes `LaMa Inpainting` workflow.
  3. **Result:**
      - ComfyUI returns the "Cleaned" image patch.
      - Editor composites the patch over the original.

---

## 2.5 Feature: Generative Fill (SDXL)

**Goal:** Creative addition/extension.

- **Workflow:**
  1. **User Action:** Select area, type prompt "Add a mountain".
  2. **Process:**
      - Electron sends Photo + Mask + Prompt.
      - Executes `SDXL Lightning` Inpaint workflow (~4 steps).
  3. **Result:**
      - Returns generated image variation as a new Virtual Copy (preserving history).

---

## Phased Rollout Schedule

| Phase | Duration | Tasks |
| :--- | :--- | :--- |
| **2.1 Perf Core** | Days 1-3 | Implement background `sharp` preview generation. Refactor `Photo` to include `VirtualCopy`. |
| **2.2 AI Bridge** | Days 4-5 | Build `ComfyClient` in Electron. Create Basic ComfyUI connection test. |
| **2.3 Masking** | Days 6-8 | Implement "Select Subject" using SAM + `regl` integration. |
| **2.4 Inpainting** | Days 9-10 | Implement "Remove Tool" brush. Integrate LaMa workflow. |
| **2.5 Polish** | Days 11-12 | Loading states, Error handling (VRAM full), Model downloaders. |

---

## Implementation Notes

- **VRAM Safety:** Always use `--lowvram` flag for AI tasks.
- **Background Performance:** All disk I/O and preview generation MUST happen in background processes.
- **Virtual Copy Focus:** All edits and history are tracked on `VirtualCopy` records. The `MasterPhoto` record is read-only.
- **Sidecar Strategy:** Prefer external files (`.jpg`, `.png`, `.json`) over database BLOBs for performance.
