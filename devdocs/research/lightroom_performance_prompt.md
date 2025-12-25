# Deep Research Prompt: Lightroom Classic Performance Architecture

**Context:**
I am a Senior Software Architect building "Stillbytes," a modern, high-performance RAW photo editor using **Electron, React, TypeScript, and Native Node Modules (C++/Rust)**. We are aiming to replicate or exceed the "smoothness" and responsiveness of Adobe Lightroom Classic, particularly regarding image browsing (Grid View) and real-time slider adjustments (Develop module).

**The Objective:**
Conduct a deep technical "reverse engineering" analysis of Adobe Lightroom Classic's performance architecture. I need to understand *exactly* how it manages to feel responsive even with 100,000+ images and 60MP RAW files, whereas naive Electron apps often struggle.

**Key Research Areas:**

1. **The Preview/Cache Systems (The "Secret Sauce"):**
    * **Hierarchy:** Define the specific layers (Thumbnail, embedded JPG, Standard, Smart Preview, 1:1).
    * **Storage:** How are they stored on disk? (Folder structure, file formats - are they standard JPGs or custom tiled blobs?).
    * **Retrieval:** When a user scrolls the grid quickly, does Lightroom fetch from the `.lrcat` database or the `.lrdata` package? What is the read-path latency optimization?
    * **"Smart Previews" Implementation:** specifically, what is the *exact* resolution and format of a Smart Preview (DNG? Lossy? Bit depth?). Does the Develop module *always* edit the Smart Preview effectively acting as a proxy, or does it switch to RAW?

2. **The "Develop" Module Pipeline:**
    * **Latency vs. Quality:** When I move the "Exposure" slider, the UI updates at 60fps. Is this rendering the *full* RAW pipeline, or a low-res approximation?
    * **Pipeline Stages:** What is the order of operations? (Demosaic -> Color Space -> Curves -> Sharpening). Which stages are skipped during slider movement vs. released mouse?
    * **Hybrid Rendering:** How does it mix CPU and GPU? Does it keep the image texture in VRAM and only send uniform updates (slider values) to a shader?

3. **Database & Metadata Strategy:**
    * **SQLite Optimization:** Lightroom uses SQLite (`.lrcat`). What specific pragmas or modes (WAL, memory mapping) do they use to handle millions of rows without UI blocking?
    * **Concurrency:** How does it handle writing metadata (XMP) without stuttering the UI? (Separate worker threads, specific priority queues?).

4. **Hardware Acceleration (GPU):**
    * **DirectX/Metal Implementation:** How precisely does it interface with the GPU? Is it effectively a game engine approach (rendering a quad with a complex pixel shader)?
    * **Memory Management:** How does it handle VRAM Eviction when switching images?

**Output Format:**
Provide a technical architectural report suitable for a Lead Engineer. Include:

* **Data Flow Diagrams** (text-based or Mermaid).
* **Specific Technology Guesses** (e.g., "Likely uses a Tiled Pyramidal TIFF structure for 1:1 previews").
* **Actionable Recommendations** for an Electron/Node.js stack (e.g., "Use `sharp` to generate tiled webp previews," "Use `better-sqlite3` with persistent workers").

**Constraint:**
Focus on *technical implementation details*, not user-facing features. Ignore "Cloud" features. Focus entirely on Local Desktop Performance.
