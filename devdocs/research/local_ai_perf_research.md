Replicating Lightroom’s AI Features with Local Models

1. AI Masking: SAM vs YOLOv8 for Subjects, Sky, Background

Lightroom’s “Select Subject/Sky/Background” can be approached with Segment Anything Model (SAM) or YOLOv8-seg in a ComfyUI pipeline. SAM is class-agnostic and can mask arbitrary regions (person, sky, etc.) given prompts or points, whereas YOLOv8-seg detects only pre-trained object classes (COCO’s 80 objects)
roboflow.com
roboflow.com
. For instance, YOLOv8 can quickly mask a person (class 0) or common objects but has no native “sky” class. SAM, on the other hand, can segment any continuous region like sky or background if guided properly.

Performance: Original SAM (ViT-H, ~2.5B params) is heavy, but newer SAM v2/v3 and distillations achieve real-time speeds. SAM2 introduced hierarchical models down to Tiny (∼5M params)
ikomia.ai
ikomia.ai
, and MobileSAM uses a Tiny-ViT encoder for ~12ms inference (on high-end GPUs)
ikomia.ai
ikomia.ai
. Meta’s SAM3 (840M params) runs ~30ms/frame on an H200 (roughly RTX 50-class)
datature.com
 – on a 12GB RTX 3060 you can expect tens of milliseconds to a few hundred (depending on model size and image resolution). In practice, SAM’s ViT-B (375MB) or MobileSAM (5M) can give near real-time segmentation on 12GB with minimal quality loss
ikomia.ai
ikomia.ai
. By contrast, YOLOv8-seg (e.g. YOLOv8n-seg ~3M params) can be extremely fast (dozens of FPS) for its classes, but it produces coarser masks and can’t capture “sky” or amorphous background easily.

Quality & Use-case: For portrait or wildlife photos, YOLOv8 yields instant subject masks (person, animal) – useful for quick subject selection. But for complex or non-standard subjects and for sky/background, SAM is far more flexible. SAM can generate multiple mask proposals for an image; using an “auto-mask” mode, it often outputs a large mask for sky if the sky is a distinct region (e.g. top portion with uniform color). In ComfyUI, you can combine detection + SAM: e.g. use YOLO to get a bounding box around the subject, then pass that to a SAM node for a precise mask
runcomfy.com
reddit.com
. SAM can also be prompted with text using GroundingDINO (open-vocabulary detector) – e.g. a ComfyUI extension allows “sky” or “background” text prompts to get corresponding masks
github.com
github.com
. This covers cases YOLO cannot handle.

Real-time Feasibility: A quantized SAM Tiny (~78MB, FP16) easily fits in 12GB and can segment ~20MP images in a fraction of a second
huggingface.co
. In testing, MobileSAM runs ~10ms for 512×512 on a single GPU (with ~8ms for encoding, 4ms decoding)
ikomia.ai
ikomia.ai
 – more than enough for interactive masking on RAW images. Meanwhile, YOLOv8n on RTX 3060 can exceed 50 FPS for 512px images. So both are “real-time” for typical usage. However, SAM’s mask quality (fine edges, hair detail) tends to be higher – important for portrait editing – whereas YOLO’s segmentations use 28×28 masks that may require blur/feather post-processing.

Verdict: Use SAM (v2/v3 or MobileSAM) for general-purpose masking (subject, sky, background) due to its flexibility and superior mask detail. YOLOv8-seg can supplement for known object classes when speed is paramount or to provide initial regions. In the ComfyUI ecosystem, both are available as custom nodes (e.g. Kijai’s ComfyUI-SAM2
github.com
 and Jags’ YoloSegNode
comfyai.run
comfyai.run
). A practical approach is: run SAM’s automatic mask generator to get proposals, use simple heuristics to pick the largest top-region mask for sky, the largest central mask for subject, etc. This yields Lightroom-like one-click selections. If needed, refine edges by dilation/feathering (ComfyUI provides mask morphology nodes). Masking throughput on a 12GB GPU should comfortably be ~10–20+ images per second with a Tiny SAM or YOLO – so editing feels instant.

1. Generative Fill / Inpainting: Fooocus vs SDXL vs LaMa

For content-aware fill (removing or adding objects via inpainting), you can leverage either diffusion models (like SDXL Inpaint, possibly via UIs like Fooocus or custom pipelines) or specialized CNNs like LaMa.

LaMa (Large Mask Inpainting)
medium.com
 is a FAST Fourier Conv-based model specifically for filling large holes. It excels at seamlessly removing objects and filling in background – thanks to global FFT layers, it preserves image resolution and context well
medium.com
. It’s one-shot (non-iterative), so it runs in a single forward pass (typically a fraction of a second on 12GB GPU) and handles huge masks without quality collapse. Example: LaMa can remove a person from a 24MP photo and plausibly regenerate the background in ~0.2–0.5 seconds, whereas naive Stable Diffusion might blur out or require many steps. LaMa’s global context (via Fast Fourier Convs) ensures even large holes are filled realistically
blogs.torus.ai
blogs.torus.ai
. However, LaMa is unguided – it simply restores background; you can’t direct it to add new content beyond what surrounding pixels suggest. It’s ideal for object removal, not for creative fills.

Stable Diffusion Inpainting (SDXL) allows guided fill: you can remove something and prompt what to fill (e.g. “add a sailboat in the lake”). This is how Photoshop’s generative fill works (using Adobe’s diffusion model). SDXL 1.0 Inpainting model (or using SDXL base with a mask) can produce highly coherent fills, especially using the refiner for fine details. But diffusion is iterative and heavier: a 1024px masked generation might take a few seconds on RTX 3060 (see Performance below). Also, large masks covering most of the image can be tricky – diffusion might produce blurry backgrounds if too much is removed
blogs.torus.ai
 (diffusion tends to need surrounding context or more steps). Using ControlNets (like Structure or Reference) can mitigate this by providing context or target for the fill.

Fooocus isn’t a model itself but an optimized Stable Diffusion UI/pipeline. It “combines the best of SD and Midjourney” by auto-expanding prompts and using tuned samplers
stable-diffusion-art.com
stable-diffusion-art.com
. Notably, Fooocus integrates LCM LoRA for “Extreme Speed” mode
stable-diffusion-art.com
stable-diffusion-art.com
. In practice, Fooocus’s default inpaint uses SDXL with ~30 steps (good quality in ~8–12 seconds on a 4090, ~20–30s on a 3060)
stable-diffusion-art.com
. Its Extreme Speed option applies an LCM-distilled model to cut steps (~10 steps), trading some detail for speed (e.g. ~5 sec on 4090, ~10–12 sec on 3060)
stable-diffusion-art.com
. Fooocus also has an “Improve Detail” inpaint method to minimally change the image (like low-denoise inpaint to enhance sharpness)
stable-diffusion-art.com
. The key takeaway is that Fast SD variants (SDXL Turbo, LCM) can make diffusion inpainting almost interactive. For near real-time results, an SDXL LCM or Turbo model can fill a mask in under 1 second (for small areas) or a few seconds (for large 1024px areas)
baseten.co
baseten.co
 – albeit sometimes with slightly lower detail or artifacts if too few steps are used
baseten.co
. In comparison, LaMa will always be ~0.1–0.2s but cannot add new concepts.

Model Comparisons:

Quality: SDXL inpaint generally yields the most creative and integrated results (since it actually understands the prompt and image). LaMa yields the most photorealistic background completions for removals (trained specifically for that) – its outputs tend to have fewer artifacts for big masks, while SD might need the refiner or more steps for equal coherence
blogs.torus.ai
. Users often combine them: use SAM+LaMa to remove unwanted objects cleanly
medium.com
, then use SDXL to add new elements via prompting.

Speed: LaMa is fastest (one-shot inference). A benchmark: removing a large object with LaMa vs SD1.5 – one report notes SD (diffusion) was “much heavier and slower than LaMa” for large-hole inpainting
blogs.torus.ai
. SDXL with 25 steps might take ~20–30 seconds on 3060 for 1024px, whereas LaMa does it in <1s, and SDXL Turbo/LCM might do ~4–8 steps in ~2–3 seconds (with some quality hit).

LCM vs Turbo vs Lightning: These few-step diffusion models shine for inpainting speed. Latent Consistency Models (LCM) generate in 2–4 steps typically
baseten.co
baseten.co
. They can achieve 1024px output in ~0.5 s on high-end GPUs
baseten.co
, but using fewer than 4 steps risks blur/artifacts
baseten.co
. SDXL Turbo (distilled via adversarial diffusion) produces higher fidelity than LCM at ~1–4 steps
baseten.co
baseten.co
. SDXL Lightning (progressive distillation) pushes quality further, often matching original SDXL quality in ~2–6 steps
baseten.co
baseten.co
. Users report Lightning’s images are much more detailed than Turbo’s
baseten.co
 – it’s essentially the best of both worlds, only marginally slower. In practical use, Lightning can do 1024×1024 inpainting in a couple seconds on consumer GPUs (and supports full resolution output, unlike some early Turbo versions)
baseten.co
. For Stillbytes, focusing on Lightning or Turbo models for generation will provide near-real-time fill with minimal quality loss. For example, SDXL Lightning can often generate 1024px images ~2× faster than standard SDXL and with better detail than a 4-step Turbo
baseten.co
.

Recommendations: Use SDXL Inpainting (or Lightning/Turbo variants) when you need prompt-driven fill or complex scene edits. Use LaMa (perhaps via a ComfyUI custom node or calling lama-cleaner library) for quick object removal or hole-filling of backgrounds – it’s a great content-aware fill. Within ComfyUI, you can integrate LaMa by a Python node or the SimpleLama wrapper
medium.com
, processing the image and mask then feeding result back into the flow. To ensure speed in an interactive app, consider an SDXL LCM/Lightning model for diffusion inpainting – it will yield inpaint results in ~1–3 seconds with acceptable quality
baseten.co
, making the “Generative Fill” feature feel snappy. If quality needs improvement, one can quietly run a slower refiner pass after initial preview.

1. Style Transfer & Creative Tools: IP-Adapter, ControlNets, Concurrent I2I/T2I

Lightroom’s creative tools (e.g. style presets or “Color Grading”) can be emulated by Image-to-Image (img2img) with ControlNets and IP-Adapters for style transfer.

IP-Adapter (Image Prompt Adapter) allows using an image as a “style prompt” in Stable Diffusion
stable-diffusion-art.com
. Essentially, an IP-Adapter is a small network that takes a reference image and injects its visual features into the diffusion process
stable-diffusion-art.com
. For example, IP-Adapter+ can transfer composition and style loosely from a reference
stable-diffusion-art.com
, while IP-Adapter Face can enforce a specific face identity in the output
stable-diffusion-art.com
. In ComfyUI, IP-Adapter nodes load a separate model (with a CLIP image encoder under the hood) and feed into SD’s UNet. VRAM efficiency is a concern: the SDXL version of IP-Adapter uses a CLIP ViT-BigG (1.8B params) by default
stable-diffusion-art.com
, which occupies ~7–8 GB VRAM alone. However, there are smaller variants (SDXL IP-Adapter trained with ViT-H, ~632M params) that reduce memory at some cost to fidelity
stable-diffusion-art.com
stable-diffusion-art.com
. On a 12GB GPU, the BigG encoder is not feasible alongside SDXL (which itself uses ~5–6 GB). Solution: Use the ViT-H based IP-Adapters for SDXL (or even the SD1.5 IP-Adapter on SDXL – it will still influence style). The ViT-H encoder (632M) will use ~2.5 GB (FP16), leaving room for SDXL. This is a known trick: many SDXL IP-Adapter models on HuggingFace are actually using the smaller encoder
stable-diffusion-art.com
stable-diffusion-art.com
. In practice, the Plus SDXL model (ViT-H) still transfers style well, just slightly less precisely than BigG.

To further save VRAM, run the IP-Adapter’s image encoder on CPU (ComfyUI can offload it). ComfyUI’s IP-Adapter extension lets you mark the module to “bypass” GPU if needed
github.com
. The encoding is a one-time cost (few hundred ms on CPU) but frees up GPU memory during the main generation. Users have noted that using two IP-Adapters (e.g. style + face) concurrently on a 12GB card exhausts memory even with one on CPU
github.com
github.com
. A workflow was able to run one IP-Adapter at a time on 12GB, but adding a second caused OOM around ~9–10 GB usage
github.com
github.com
. So, a recommended strategy is: use at most one IP-Adapter at once, and if you need multiple (e.g. fix face and apply style), run them sequentially (generate intermediate image with style, then feed that into face adapter, etc.). This avoids simultaneous VRAM load. Another approach is to leverage ControlNet for certain tasks instead of a second IP-Adapter (e.g. use ControlNet Reference for color/style transfer combined with an IP-Adapter for face, which might be lighter).

ControlNets – minimal set: For general image-to-image operations, you can limit to just Canny edges and Depth maps as ControlNet inputs. These two capture most structural information: Canny gives fine outlines/edges, Depth (via MiDaS or LeReS models) gives 3D structure and perspective. In ComfyUI, you can attach multiple ControlNets; composing a depth map with an edge map is a powerful combination that preserves the original composition faithfully
huggingface.co
huggingface.co
. For example, to stylize a photo: use ControlNet Depth + Canny from the photo, and prompt “oil painting” – the output will maintain the scene layout (via depth) and object contours (via edges), but rendering in the new style. This minimal pair covers most “style transfer” needs without loading many specialized models. Other ControlNets (like OpenPose, Segmentation, etc.) are only needed for specific tasks (human pose control, semantic re-style). Canny+Depth is a lightweight set – the SDXL ControlNet models for these are small (~300MB each) and can run concurrently on 12GB. (When using two ControlNets, remember to adjust their influence; ComfyUI allows a controlnet_conditioning_scale per input
huggingface.co
 – often values ~0.5 each work well so neither over-constrains the generation.) As a rule, avoid loading unnecessary ControlNets – each one is like ~1–2GB VRAM when loaded. Sticking to one or two keeps memory in check.

IP-Adapter + ControlNet: Interestingly, these can be combined. For instance, an IP-Adapter can inject a reference image’s color tone while ControlNet Depth preserves composition. This way you mimic “style presets”: feed a style image through IP-Adapter (for color palette/mood) and lock the structure of your target photo with depth or canny. This is an efficient workaround to avoid multiple diffusion passes. ComfyUI supports connecting both an IP-Adapter and ControlNet to the same SDXL pipeline graph.

Concurrent text-to-image and image-to-image: You’ll likely want to support both pure generation (text→image) and transformation (image→image) in the Stillbytes app. With ComfyUI, you can set up one master workflow graph that handles both. One method is to design a graph with a switch: if an input image is provided, use it along with a strength parameter (for img2img), otherwise fall back to pure noise for text2img. In ComfyUI, you can simulate this by having both an Empty Latent node and an Image Latent Encode node feeding into a conditional blend node. However, it might be simpler to maintain two configured workflows – one for text2img, one for img2img – and select at runtime. The ComfyUI API allows specifying which workflow JSON to run for a given prompt. Since models are persistent in memory, switching between workflows is fast (no reload needed). Ensure that both workflows share the same loaded SDXL model (ComfyUI will reuse the model in VRAM if the model node name is the same). Also, use consistent device placement – e.g. keep VAE on GPU for both, etc., to avoid thrashing. This enables quick toggling: users can generate from scratch, then drag that image into the app and apply img2img with style adapters or ControlNet in seconds.

To efficiently handle concurrent tasks (like processing a batch of images or performing T2I and I2I in parallel), ComfyUI’s execution queue will serialize them by default. Since we only have one GPU, it’s best to queue tasks rather than truly parallelize (to avoid VRAM overload). Still, you can prepare one image while another’s results are sending to the UI, etc. ComfyUI does support multiple GPU devices if available, but on a single 12GB GPU, sequential execution with quick model swaps is the way to go.

1. ComfyUI API Orchestration (Electron/Node front-end)

Integrating ComfyUI as a backend in an Electron app can be done via its HTTP and WebSocket APIs. ComfyUI runs a local server (default localhost:8188). Key endpoints and techniques:

Submit Workflows: The primary REST route is POST /prompt. You send a JSON payload of the workflow (nodes and their settings) and ComfyUI enqueues it
docs.comfy.org
docs.comfy.org
. The response gives a prompt_id and a queue position number. For example, your Node process would assemble a JSON with the SDXL model node, ControlNet nodes (if any), and the prompt, then call POST /prompt. You don’t have to build this JSON from scratch each time – you can design a base workflow in ComfyUI’s UI, save it, and then programmatically fill in fields (like prompt text or image paths) before submission.

Queue Management: ComfyUI has an internal execution queue. You can query GET /queue for the current queue status or position of jobs
docs.comfy.org
. It also provides POST /queue to clear or cancel jobs (e.g. if a user aborts an operation)
docs.comfy.org
. Typically, you won’t need to manipulate this much – just submit and let it handle one at a time. But if building a custom queue in Node, you might limit concurrent submissions to 1 to avoid an unexpected memory spike.

Real-time Updates: The WebSocket at ws://localhost:8188/ws streams events for progress
docs.comfy.org
. Upon connecting, you’ll receive JSON messages like:

status (overall status and VRAM usage),

execution_start (when a prompt begins),

progress (with percentage or current step, for nodes that report it),

executed (when each node finishes), and finally

execution_done (when the whole workflow completes with outputs).
ComfyUI will send the output image(s) as paths or URLs (e.g. it saves images to output directory by default, accessible via GET /view?filename=...). Your Electron app can listen on the WebSocket to show a progress bar (e.g. “Masking… 50%”) and then load the resulting image when done. For instance, on execution_done you might get { prompt_id: 123, output: [ "output/12345.png" ] } – your Node code can then load that file and send it to the frontend.

Triggering Masking vs Inpainting vs Style: You can set up separate workflows (or single workflow with switches as discussed) for each AI feature (mask, fill, style transfer). From the UI buttons (Electron frontend), call the Node backend which, using a ComfyUI client, submits the appropriate workflow. For example, a “Auto Mask Sky” button would trigger a SAM workflow: Node posts the image to /upload/image (if not already in ComfyUI’s memory)
docs.comfy.org
, then posts the masking workflow JSON referencing that image. ComfyUI would output a mask image (which you can retrieve via /view). Then you could composite that mask in the renderer (e.g. overlay red tint) for user preview. This requires orchestrating multiple steps, which is doable with a small queue system on the Node side (submit mask job, wait for done, then use result in next job, etc.).

Code & Libraries: Instead of crafting HTTP calls manually, you can use community SDKs: e.g. comfyui-client (StableCanvas) or comfyui-sdk (Saint NO). These provide a higher-level interface. For example, using the SDK, you can do:

import { ComfyUIClient } from 'comfyui-sdk';
const client = new ComfyUIClient({ baseUrl: '<http://localhost:8188>' });
const workflow = { /*JSON for SDXL inpaint workflow*/ };
const artifacts = await client.run(workflow);  // submits and waits for completion
console.log(artifacts[0].manifest.width);  // example output metadata access

This one-liner client.run() handles sending to /prompt, waiting on the WebSocket for completion, and downloading the resulting file(s)
dev.to
. The SDK also supports progress callbacks and can manage a pool of ComfyUI workers if needed
dev.to
dev.to
. Similarly, comfyui-client (StableCanvas) supports both REST and WS with full TypeScript types
github.com
github.com
. It even has a workflow builder to dynamically tweak nodes. Using these libraries can simplify integration a lot.

Architecture: The Electron app’s architecture might look like this:

【※ Architecture Diagram – Electron/Node & ComfyUI API interaction omitted due to text format】

(Diagram: The React frontend triggers a Node IPC call (e.g. “generate with prompt X”). The Node main process uses ComfyUI’s HTTP API to post the workflow. ComfyUI (Python backend) running locally on GPU executes it and streams progress via WebSocket. Node relays progress events back to the frontend, and finally, Node retrieves the resulting image (either from disk or via HTTP GET /view) and sends it to the frontend for display. Meanwhile, the GPU handles the heavy computations.)

Queue & Event Handling: It’s wise to implement a job queue in the Node layer as well. For instance, if the user spams “generate”, you can decide to queue them or drop previous tasks. ComfyUI will queue automatically, but managing it yourself allows you to show a custom queue UI or cancel jobs more easily (ComfyUI does support POST /interrupt to stop ongoing generation
docs.comfy.org
). For events, attach a single WebSocket listener when your app starts. Use the prompt_id to correlate messages to the task you launched (the SDK does this internally).

Monitoring Mask/Fill pipelines: If you have long chains (e.g. first run SAM, then run SD inpaint), you could combine them in one ComfyUI workflow (SAM nodes -> mask -> SD inpaint node). However, that may be complex. It might be simpler to run SAM masking as one workflow, get the mask image, then run the inpainting as a second workflow using that mask (feeding it via an input node). This way, each stage’s result is accessible to the app (you can even allow user to tweak the mask between steps). Use ComfyUI’s temp file mechanism or the API’s ability to upload user data (there are /upload/image and /upload/mask endpoints
docs.comfy.org
) to pass intermediate results into the next stage.

In summary, orchestrating through Node is straightforward with ComfyUI’s API. The combination of REST (to submit/poll) and WebSocket (for live progress) gives a responsive experience.

Example: A user clicks “Remove Object” in Stillbytes UI. The app (Node) sends the photo and a user-drawn mask to ComfyUI’s inpaint workflow with LaMa. Through WS events, it updates “Filling…”. Once done (execution_done), it fetches the output image from ComfyUI (e.g. saved in ComfyUI/output folder) and replaces the preview in the UI. Total latency can be under a second for LaMa, or a few seconds for SDXL – which is acceptable in an editing flow.

1. Performance Optimization (VRAM & Speed)

Even on a 12GB RTX 3060, careful optimizations can yield near real-time performance for these AI features:

TensorRT Acceleration: Compiling models to TensorRT can significantly boost throughput. NVIDIA reports SDXL Turbo (distilled 1-step model) running up to 4 images/sec on RTX GPUs with TensorRT
developer.nvidia.com
. That is real-time generation – ~250ms per image, versus ~2–3s per image under PyTorch. Similarly, a Latent Consistency model LoRA with TensorRT ran ~9× faster than standard (50 → 4 steps)
developer.nvidia.com
. The trade-off: setup complexity and rigidity. Converting SDXL to TensorRT involves a lengthy compile and the engine will be fixed to a GPU and batch size. For an Electron app, it might be overkill unless you target power-users. However, for production, consider shipping an optimized engine: e.g. StabilityAI’s TensorRT-optimized SD3.5 models show 2.3× speedup and ~40% VRAM reduction with FP8 quantization
stability.ai
stability.ai
. FP8 TensorRT on SD3.5 Large cut memory from 19GB to 11GB while maintaining image quality
stability.ai
stability.ai
 – a big win for consumer cards. On SDXL, we can expect similar ~2× speedups with FP16→FP8. Setup cost: building the engine can take tens of minutes and requires NVIDIA’s toolkit; it might not be practical to do on user’s machine on the fly. Instead, you might offer a download of a pre-compiled engine (like NVIDIA did with their WebUI TensorRT extension
developer.nvidia.com
). In short, TensorRT can double performance, but only pursue it if you’re comfortable managing engine files and potential compatibility issues. For initial development, stick to PyTorch and optimize at the model/config level.

FP8 / Quantization: Without full TensorRT, you can still leverage lower precision. PyTorch 2.1 introduced experimental FP8 support on Ada GPUs. Alternatively, INT8 or GPTQ 4-bit quantization can be applied to models. For diffusion, there’s not a plug-and-play INT8 yet, but FP16 is default. If using --fp8 flags in ComfyUI (it has options for --fp8_e4m3fn-unet etc. to store weights in FP8
GitHub
), you could reduce VRAM usage dramatically. Note that FP8 quantization may slightly affect output quality (usually minor if calibration is good). StabilityAI’s tests showed virtually no quality drop for SD3.5 using FP8 TensorRT, with the benefit of 40% less memory and faster speed
stability.ai
stability.ai
. On RTX 4070/4080/4090 (which support FP8 Tensor Core), enabling FP8 could let SDXL Large fit in ~8–9 GB (down from ~14 GB FP16). The 3060 (Ampere) doesn’t support FP8 in hardware, so it would have to emulate – not beneficial. So FP8 is more relevant if you anticipate users on 40-series cards. Still, you can quantize some parts: e.g. text encoder to 8-bit (which many do, since it has minimal quality impact). ComfyUI allows --fp8_e4m3fn-text-enc
GitHub
 – that alone saves a few hundred MB.

Model Distillation (Turbo/Lightning): We’ve covered Turbo vs Lightning above. The trade-off is mainly resolution vs quality vs speed. Early SDXL Turbo releases only generated 512×512
baseten.co
, but newer ones (Lightning) do full 1024. Turbo at 1 step might miss fine details or require the refiner which slows it again – whereas Lightning at ~2 steps yields much better details
baseten.co
. For Stillbytes, using SDXL Lightning as the default generative model might be ideal: it’s ~1.5× faster than full SDXL
baseten.co
 while preserving quality for 1024px outputs. For an extra speed boost when users choose “fast preview”, you could drop to an LCM or Turbo model for quick drafts (with notice that quality will be refined later). Distilled models are also smaller: SDXL base is 2.6B params; Turbo/Lightning student models can be <1B (Lightning uses progressive distillation with smaller U-Nets
baseten.co
). This can reduce VRAM and load times. Experiment with these to find a good balance – e.g., Lightning at 3 steps might achieve 90% of quality in 1/5 the time of SDXL at 30 steps
baseten.co
.

Memory optimizations: For handling large RAW images (45MP+ ~ “mega-pixel” images), the critical part is VAE decoding/encoding, since full-resolution latents can be huge. Tiled VAE is the solution. Instead of decoding the entire latent in one go (which uses O(W*H) memory), you decode in smaller tiles (e.g. 256×256) and stitch the image. ComfyUI has a Tiled VAE Decode node in the TiledDiffusion extension
comfyai.run
comfyai.run
. This allows reconstructing extremely high-res images by chunking. For example, a 8192×8192 image can be decoded in 256px tiles with minimal VRAM (each tile’s latent is only 16×16 if VAE latent ratio is 1/16). It trades a bit of speed and may introduce slight seams if not careful (the extension uses overlap to avoid seams). In practice, enabling tiled VAE decode means you won’t OOM on export or large edits. The UI can still operate on a downscaled preview (like Lightroom does) and only use tiled decode when applying to full res at the end. Similarly, Tiled Diffusion is available (to do the diffusion process in tiles for super high-res outpainting/upscaling scenarios)
runcomfy.com
comfyonline.app
, though for typical RAW photos you might not need that except for extreme panoramas. The key is: use the Tiled VAE for any image larger than ~2048px to keep memory in check – ComfyUI’s extension makes it easy, just drop in the VAEDecodeTiled node and set tile_size (256 is a good default)
comfyai.run
comfyai.run
.

ComfyUI VRAM Flags: Launch ComfyUI with appropriate memory mode. On a 12GB card, the default “auto” usually picks something like normalvram mode (which keeps models in VRAM). If you run into memory issues (especially with multiple models loaded, e.g. SDXL + ControlNet + IP-Adapter), try --lowvram. The --lowvram flag splits the UNet into chunks and unloads parts when not in use
GitHub
. This dramatically lowers peak VRAM (at cost of ~10–20% speed). It’s similar to A1111’s “medvram” mode. ComfyUI also has --highvram and --cpu modes, but those are not needed unless debugging. In testing, on 3060 12GB, SDXL often auto-enables lowvram itself. If not, you can force it. There’s also a “smart memory management” setting (LRU caching of nodes, etc.), which by default offloads unused model weights to CPU RAM when not needed. Ensure this is on (it usually is) – it means, for example, after generating, if you call /free or start a new job, ComfyUI might move the SDXL weights out of VRAM if it needs to load an IP-Adapter momentarily, then move them back. It’s not instant (moving 5GB to CPU takes a couple seconds), but it prevents crashes. In the Server config, you’ll see modes like auto, low, normal, high VRAM and an option “Disable smart memory” – do NOT disable smart memory in a 12GB scenario
docs.comfy.org
docs.comfy.org
. Let it unload models as needed. You can also manually trigger unloading via API: POST /free with a model type to unload (e.g. send {"model": "sdxl"} to unload SDXL from VRAM after generating)
docs.comfy.org
. You might do this right before loading the LLM, for instance.

Precision settings: ComfyUI allows forcing certain components to lower precision. On 12GB, running SDXL’s UNet in FP16 is recommended (cuts VRAM nearly in half vs FP32, with negligible quality loss) – this is likely default already. If not, use --fp16-unet
GitHub
. The VAE can also be FP16, but occasionally that caused output issues (black images) in older SD – in SDXL it’s usually fine; try --fp16-vae and if you see color banding, switch to auto/FP32. The text encoder can safely be FP16 or even FP8; saving ~0.5GB. So overall, ensure you aren’t accidentally in FP32 mode: check logs or just enforce --force-fp16. Also use channels-last memory (--force-channels-last) which can marginally improve throughput on NVIDIA GPUs by aligning tensors
GitHub
.

Tensor cores and xFormers: Under the hood, ComfyUI uses PyTorch with optimizations. It will by default use Tensor Cores for FP16 and even the CUDA Graphs (cudaMallocAsync) if available
GitHub
 – this helps performance. Just make sure your PyTorch is up to date (2.1+ for best performance on SDXL). You don’t explicitly need xFormers anymore, as PyTorch’s native attn is good, but ComfyUI might still allow an xFormers option.

Benchmarks (target): On RTX 3060 12GB:

SDXL base 1024px 25 steps: ~1.3 it/s (about 24s per image)
reddit.com
.

SDXL Turbo/Lightning 4 steps: ~5–6 it/s (4× faster), effectively ~4–5s per image at good quality.

SDXL LCM 2 steps: ~10 it/s (but quality might be fuzzy).

SD1.5 (for comparison): ~6 it/s at 512px 20 steps (3–4s per image).

With TensorRT FP8: you could see >2 it/s for SDXL at full quality (NVIDIA showed 2.3× speed on SD3.5
stability.ai
).

LLM (13B) Generation: A 13B parameter model (e.g. LLaMa-2 13B) with 4-bit quantization and some GPU offload can achieve ~10–20 tokens/sec on a 3060
reddit.com
. Users reported ~10–29 tok/s depending on context length for 3060 12GB
reddit.com
, which aligns with our experience. A smaller 7B model or more aggressive quant (g4 or g5) could push ~30–50 tok/s. (For instance, a 7B at 8-bit on 3060 ~45 tok/s
localllm.in
; Mistral 7B even 70 tok/s
databasemart.com
.) These speeds mean generating a caption or response of 50 tokens takes ~2–5 seconds – reasonable in an editing workflow. If that’s too slow, consider using an LLM on CPU (to free GPU) when appropriate; e.g. GPT4All or similar smaller models if high quality isn’t needed.

Precise Flags: Here’s a list of recommended launch flags and settings for optimized runs:

ComfyUI: --lowvram (enable VRAM-saving mode, splitting models)
GitHub
, --precision=auto (let it choose FP16), or explicitly --fp16-unet --fp16-vae to force half precision UNet/VAE. Use --force-channels-last for a minor perf boost. If using an Ada GPU (40xx), you can experiment with --fp8_e4m3fn-unet (store UNet in FP8) and --fp8_e5m2-text-enc to save memory – but test for any quality issues. For multi-process safety, you might also run with --cuda-malloc (async allocator) which is default on PyTorch 2.x (ensures better mem reuse). Example: python main.py --lowvram --fp16-unet --fp16-vae will make ComfyUI fit SDXL + extras in 12GB reliably.

llama.cpp (Node bindings): Use quantized models (e.g. 13B-q4_0.bin) and enable GPU offload. For @fugood/llama.node (Node binding) you can select the CUDA build which supports GPU layers
github.com
. Configure it to offload e.g. 20 out of 40 layers to GPU (whatever fits ~6GB). If using the CLI: ./main -m model-q4.bin -ngl 20 -t 8 -c 2048 (for 8 threads, 20 layers on GPU, 2048 context). The Node bindings often auto-detect and offload as much as possible by default
node-llama-cpp.withcat.ai
. You might set a GPU memory fraction (some libraries allow gpu_mem_fraction setting) so it doesn’t hog all VRAM. For example, MLC-LLM allows specifying “use at most X% GPU”
huggingface.co
 – you could allocate say 50% (6GB) to LLM and leave ~6GB for SDXL, if you ever were to run them simultaneously. In practice, it’s easier to not overlap but rather swap (discussed next).

Python libs: If orchestrating from Python, lama-cleaner (for LaMa), Diffusers (if not using ComfyUI for some reason), and llama-cpp-python are useful. But since we focus on ComfyUI and Node, those aren’t required.

1. Concurrent Runtime: Swapping SDXL and LLM on 12GB

A 12GB GPU cannot host a large diffusion model and a large language model concurrently with full precision – you’ll need to time-slice or swap them. Here are techniques to handle a 6GB SDXL model and a ~6GB LLM:

Unload/Reload on Demand: The simplest approach is to not keep both in VRAM at once. When the user invokes an LLM feature (say generating a text description for an image or an assistant dialog), you can unload the SDXL model (ComfyUI /free API or using --lowvram so it was perhaps already mostly on CPU) and then load the LLM into VRAM. After the LLM task, unload it and reload SDXL for image tasks. This will introduce a few seconds delay on each swap (loading 6GB of weights from disk to VRAM might take ~3–5s). To mitigate, keep the models in CPU RAM when “unloaded” so that moving them to GPU is faster than reading from disk. For example, you could initialize the LLM with GPU=0 (offload to GPU) or GPU=-1 (CPU) and then at runtime switch device. Some frameworks allow moving the model to GPU with a single call (in PyTorch: model.to('cuda')). ComfyUI can likewise keep SDXL model in a cpu mode if you start with --cpu (but then generation is extremely slow; better to truly unload and re-load). Perhaps a better idea: run the LLM in a separate process (like a background Python or use a local LLM server like Ollama) that uses CPU and maybe a bit of GPU. That way SDXL stays loaded in ComfyUI. For instance, you could run a 7B LLM on CPU (it will be slow ~2–3 tok/s, but maybe okay for short outputs), or use a smaller quant.

Shared Memory via MLC or vLLM: Tools like MLC-LLM compile the model to use both CPU and GPU memory effectively. You can specify a fraction of GPU memory to use
huggingface.co
. If you set, say, 0.5 (50%), the LLM will try to use ~6GB GPU and keep the rest on CPU, dynamically swapping layers in/out. This is somewhat analogous to how paging or NVIDIA’s Unified Memory would work. It prevents OOM by not fully residenting the model. However, if at the same time SDXL is also in GPU, you might still overshoot. It’s safer to allocate distinct timeslices: e.g. when user is editing images (SDXL active), keep LLM at minimal footprint (maybe 0% GPU, i.e. CPU-only or a very tiny GPU fraction), and when user opens a chat or caption feature, pause image ops and allocate memory to LLM.

TensorRT-LLM: If you convert the LLM to TensorRT (or use NVIDIA’s FasterTransformer), you could also gain speed and possibly load it int8. But running two TensorRT engines (one for SDXL, one for LLM) still won’t allow >12GB usage. Instead, consider using the TensorRT-LLM engine in streaming mode. NVIDIA’s TensorRT for LLM can stream output from CPU while rotating weights to GPU as needed (somewhat like vLLM). This is advanced; probably not needed for 13B scale.

Memory Pooling: There isn’t a way to truly “share” memory between two models in PyTorch – each will allocate its own chunks. But if both models are small enough, you can technically load them together. For example, if you quantize SDXL heavily (say an 8-bit version ~3GB) and also quantize LLaMa 7B (4-bit ~4GB), together ~7GB, which fits. But generation speed/quality might suffer. Given Lightroom’s scenario, it’s acceptable to have a brief mode switch (the user isn’t likely generating images and text simultaneously in the same second).

Recommended Strategy: Pseudo-concurrency via orchestration. Keep SDXL loaded when in “image editing mode”. Spin up a separate process (or utilize CPU threads) for the LLM and call it when needed. For example, use llama.cpp with GPU offload limited to 4GB – it will run ~10 tok/s and leave ~8GB free for SDXL (which might remain loaded). Or simply unload SDXL for the moment – a 5 second delay to reload SDXL might be fine if the user just got a caption and is now switching back to image gen. You could hide this latency via UI (e.g. show a “Loading AI model…” indicator once in a while). Since Stillbytes is all local, the user might expect some load time for big features.

Multi-modal memory pooling: There is research into unified memory for multi-modal models, but in practice on consumer GPUs, it’s manual. One interesting approach is to use a smaller text model such as OpenCLIP text encoder as an LLM for simple tasks (like tagging images) – that’s already loaded with SDXL. But for actual captions or user queries, you do need a real LLM. If your LLM is only for short tasks (e.g. suggest a photo edit or describe the image), you can also consider using an MLC compiled model on CPU – modern CPUs with 8+ cores can do a 7B model in a few seconds per sentence, which may be acceptable and avoids GPU interference entirely.

To directly answer: Yes, you can swap a 6GB LLM and 6GB SDXL on a 12GB GPU by not running them concurrently. Use comfyUI’s VRAM management plus external LLM tools to dynamically load/offload. For instance, ComfyUI in lowvram mode will drop SDXL to CPU when idle
docs.comfy.org
; at that point you can load the LLM to GPU, then when done, free it and resume SDXL (which ComfyUI will swap back in). This dance can be automated with script hooks or just sequential API calls.

1. Implementation Artifacts & Libraries

Finally, some concrete artifacts to deliver in your implementation:

Benchmarks: On RTX 3060, SDXL (full quality) ~1.3 it/s (25 steps ~20–25s)
reddit.com
. With SDXL Lightning, expect ~3–5 it/s at 512px (5–8s for a hi-res image). With SD1.5 or small models, >5 it/s easily. LLM 13B (4-bit) ~10–15 tokens/s
reddit.com
, meaning a 50-token caption in ~4s. A 7B LLM can be ~30 tokens/s
databasemart.com
 (50 tokens ~1.7s). These numbers help set user expectations (e.g. a “Generating…” spinner that usually completes in <5s). It’s also useful to note memory use: SDXL with one ControlNet ~7GB VRAM, with two ~9GB. SAM Lite ~1–2GB. So in heavy combos (SDXL+2 ControlNet+IP-Adapter) you might hit 12GB – hence the importance of model swapping and lowvram mode.

ComfyUI Flags (optimized):

--lowvram – enables chunked execution to stay within VRAM
GitHub
.

--fp16-unet and --fp16-vae – half precision for diffusion model (ComfyUI may do this by default, but you can force it)
GitHub
.

Alternatively: --force-fp16 to half-precision globally (except text encoder which stays FP32 unless specified).

For SDXL, also use --bf16-text-enc or --fp16-text-enc to lower text encoder precision
GitHub
.

--force-channels-last – optimize memory layout
GitHub
.

If you have an Ada GPU (like a 4070), try --fp8_e4m3fn-unet (and add --supports-fp8-compute to override device check) to test FP8 – it could reduce VRAM usage by ~30% for the UNet at slight risk of quality
docs.comfy.org
docs.comfy.org
.

Use --no-preview (or set preview method to none) in production if you don’t want ComfyUI generating intermediate previews to save a bit of VRAM and time
docs.comfy.org
.

In summary, for Stillbytes on 12GB: a safe launch could be:
python main.py --lowvram --precision=auto --fp16-unet --fp16-vae
This ensures low VRAM usage and half precision where it matters.

llama.cpp/Node Flags:

For llama.node (Node binding of llama.cpp) using CUDA: no explicit flags needed in code – ensure you install the cuda variant and it will use GPU if n_gpu_layers > 0. You can configure n_gpu_layers (number of layers on GPU) and n_threads. For example, in code: llama.load({ modelPath, nGpuLayers: 20, nThreads: 10 }).

If using llama-cpp-python in a subprocess: you’d run LLAMA_CPP_ARGS="--n-gpu-layers 20" or similar.

If using vLLM or FasterTransformer, set their GPU memory fraction (e.g. vLLM’s engine arguments allow fraction of GPU memory to use
docs.vllm.ai
).

Also consider the context length: using 2k or 4k context will allocate more VRAM for the KV cache. If you only need short prompts (say 256 tokens), keep context low to save memory.

Use quantized models: a 4-bit quant of 13B is ~7GB RAM (or ~3.5GB VRAM if fully offloaded). 8-bit of 7B is ~4GB. Plan these so that one fits alongside SDXL if needed.

Libraries:

ComfyUI-client or SDK: Highly recommended for orchestrating workflows from Node (makes it easy to send workflows and handle results in a promise/event style). These handle details like retrieving images from ComfyUI’s output folder.

Node llama.cpp bindings: You can use @fugood/llama.node which supports GPU (CUDA and Vulkan)
github.com
, or node-llama-cpp which also auto-detects GPU. These allow you to run LLM inference directly in the Node process. Alternatively, run a lightweight LLM server (like Ollama) and call it via HTTP from Node – Ollama is optimized for Mac but also works on Windows/Linux and manages model loading/offloading for you. Since Stillbytes is Electron, a pure Node solution (llama-node) keeps it self-contained.

Image processing: You already use Sharp/Canvas for normal edits. Continue to use those for any final compositing (e.g. applying the mask to the image, blending inpaint results, etc.).

SAM and others: If you want a fallback or alternative to ComfyUI for SAM, you could use Facebook’s segment-anything Python API with ONNX or a lighter model (MobileSAM has a pip package). But since ComfyUI has SAM nodes, it’s simpler to use those for consistency.

LaMa integration: Use the simple-lama-inpainting package as shown in the example code
medium.com
 if not using a ComfyUI custom node. It loads the LaMa model and applies the mask – you can call this Python from Node via an embedded Python or a microservice. However, it might be cleaner to create a ComfyUI custom node for LaMa (if one doesn’t exist), so you can keep everything in one graph.

Architecture Diagram / Charts: Ensure to document your system architecture. For instance, include a diagram illustrating the Electron <-> Node <-> ComfyUI data flow (as described above). Also, maintain a chart of memory usage of various model combinations to guide dynamic swapping decisions. For example:

Model Combination VRAM Usage (approx) Notes
SDXL base + VAE (fp16) ~6.5 GB (1024px, UNet+VAE half)
SDXL + Depth+Canny ControlNet ~9 GB Each ControlNet ~1.2 GB
SDXL + IP-Adapter (ViT-H) ~9–10 GB IP-Adapter H ~2.5 GB
SDXL (lowvram split) + LLaMa 7B (4-bit, half offloaded) ~12 GB total SDXL ~5 GB (split), LLM ~5 GB (4-bit offload)
SAM (ViT-B) ~2 GB For 1024px mask gen
SAM (MobileSAM 5M) ~0.5 GB Virtually negligible
LLaMa2 13B 4-bit offloaded 50% ~4 GB GPU + 8 GB CPU ~20 tokens/s gen speed

This kind of reference helps decide when to unload models. E.g. if user invokes IP-Adapter while two ControlNets are active, you know you’re pushing limits (~11+ GB); you might temporarily drop one ControlNet or use CPU VAE to save memory.

By implementing the above, the Stillbytes app can deliver Lightroom-like AI magic (masking, filling, styling) on local hardware. The key is optimizing for the 12GB constraint: use lighter model variants (MobileSAM, SDXL Lightning, quantized LLMs), leverage tiled processing for big images, and orchestrate model loading so that you time-share the GPU between tasks. With these techniques, a 3060/4070 can indeed perform near real-time photo edits with AI, all within an Electron app with ComfyUI as the powerful backend. Enjoy building!

Sources: Segment Anything vs YOLO insights
github.com
comfyai.run
; performance claims for SAM3
datature.com
 and MobileSAM
ikomia.ai
ikomia.ai
; generative fill model comparisons
blogs.torus.ai
baseten.co
baseten.co
; SDXL Turbo/Lightning/LCM trade-offs
baseten.co
baseten.co
; ControlNet usage
huggingface.co
; ComfyUI API docs
docs.comfy.org
docs.comfy.org
; memory flags and tiled VAE
comfyai.run
comfyai.run
; TensorRT acceleration data
developer.nvidia.com
stability.ai
; VRAM management options
docs.comfy.org
GitHub
; and Node llama bindings
github.com
, as detailed above.
