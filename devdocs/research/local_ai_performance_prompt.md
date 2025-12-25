# Deep Research: Maximizing Local AI Performance on Consumer Hardware (12GB VRAM)

## Research Objective

We are building **Stillbytes**, an AI-native RAW photo editor that runs locally on the user's desktop. We need to implement extensive AI features (intelligent editing, masking, generative fill, chat assistance) using **Local LLMs** and **Stable Diffusion (via ComfyUI)**.

**Constraint:** The target hardware is a modern mid-range consumer GPU with **12GB VRAM** (e.g., RTX 3060/4070). The goal is to maximize inference speed and model quality without hitting Out-Of-Memory (OOM) errors, ensuring a seamless user experience indistinguishable from cloud services.

Please provide a comprehensive technical report covering the following areas. Be specific, citing tools, libraries, and architectural patterns.

## 1. Local LLM Optimization (12GB VRAM)

We need a responsive LLM for natural language image editing commands.

* **Quantization Formats**: Compare **GGUF** (llama.cpp) vs. **EXL2** (ExLlamaV2) vs. **AWQ**. Which offers the best token/sec vs. VRAM usage ratio for a 12GB card?
* **Model Selection**: What are the best-in-class ~7B–11B parameter models for instruction following in 2024/2025? (e.g., Llama 3, Mistral, Command R)?
* **Context Management**: Strategies for handling long system prompts without bloating VRAM (KV Cache quantization, PagedAttention)?
* **VRAM Offloading**: Analysis of hybrid CPU/GPU inference. How much speed is lost if 1-2GB of layers are offloaded to system RAM?

## 2. Stable Diffusion / ComfyUI Optimization

We use **ComfyUI** as the backend for all generative and vision tasks. We aim to **replicate and exceed Lightroom Classic's AI suite** (Masking, Generative Fill) and add creative generation features (Style Transfer, T2I).

**Core Requirements to Replicate:**

s***AI Masking (LR Style)**: "Select Subject", "Select Sky", "Select Background".
    *   **SAM vs YOLO**: Compare Segment Anything (SAM) vs YOLOv8-seg specifically within the ComfyUI ecosystem. Which offers the best latency/VRAM trade-off on a 12GB card?
    *   Can we run a quantized SAM on consumer hardware for real-time masking feedback?

* **Generative Fill / Remove**: High-quality in-painting to remove objects or expand borders.
  * **Real-time focus**: Prioritize workflows (e.g., LCM, Turbo) that work near real-time on 12GB VRAM.
  * Which in-painting models (Fooocus, SDXL Inpaint, LaMa) offer the best balance of speed vs. coherence?
* **Style Transfer & Creative Gen**:
  * **IP-Adapter**: Strategies for using IP-Adapter for style transfer without blowing VRAM.
  * **ControlNet**: Minimal set of ControlNets needed for structural guidance (Canny/Depth) in I2I workflows.
  * **Text-to-Image / Image-to-Image Interface**: Configuring ComfyUI to handle standard generation requests concurrently with editing tasks.

**Integration & Orchestration (Crucial):**

* **ComfyUI API**: Provide detailed examples of triggering these specific workflows (masking, inpainting) via the ComfyUI API (WebSockets/HTTP) from a **Node.js/Electron** environment.
* **Architecture**: Please provide **architecture diagrams or code snippets** showing how the Node.js backend should orchestrate ComfyUI (e.g., queue management, handling socket events, retrieving generated images).

**Performance Questions:**

* **TensorRT Acceleration**: How to practically implement TensorRT engines for ComfyUI? What are the speed gains vs. build time trade-offs?
* **FP8 Inference**: Feasibility of running SDXL or SD3 in **FP8** mode on consumer cards. Does it degrade quality noticeably for photo editing?
* **Model Distillation**: Usage of **SDXL Turbo** or **Lightning** models for <1 second generation. Are there quality downsides for in-painting/generative fill?
* **Memory Optimization**:
  * **Tiled VAE**: Best settings for decoding large images (45MP+) without OOM.
  * **Model Offloading**: Settings to aggressively unload models from VRAM when not generating (typical ComfyUI flags like `--lowvram` vs `--normalvram`).

## 3. Concurrent Pipeline Architecture

How do we run *both* an LLM and an Image Generator on the same 12GB card without crashing?

* **API Integration**: Best practices for interfacing Electron with the **ComfyUI API** (WebSockets/HTTP) for real-time feedback.
* **Model Swapping Strategy**: How fast can we swap a 6GB LLM for a 6GB SDXL model? seconds? ms?
* **Shared Memory**: innovative techniques to keep weights in system RAM and fast-load to VRAM?
* **Unified Backends**: Are there backends (e.g., MLC LLM, TensorRT-LLM) that can manage memory pools for both modalities?

## 4. Implementation Artifacts

* **Benchmarks**: Provide estimated tokens/sec and it/sec numbers for 12GB cards in these configurations.
* **Actionable Configs**: Specific command-line flags for `llama.cpp` and `ComfyUI` to execute these optimizations.
* **Library Recommendations**: Python libraries or Node.js bindings to orchestrate this efficiently in an Electron app.
