Phased UI Overhaul Plan for Stillbytes (Desktop RAW Editor)
Application Layout and Workflow
Stillbytes should adopt a desktop-style UI layout modeled after Lightroom Classic and Darktable, with a primary grid (gallery) view for browsing and a dedicated edit view for adjustments. The Library/Grid view displays thumbnails for rapid culling and selection, while the Edit view shows a large preview of the selected photo alongside adjustment controls. A persistent filmstrip of thumbnails in the edit view allows quick navigation between images without fully switching back to the grid
docs.darktable.org
darktable.org
. This minimizes context loss – users can move to the next photo instantly via the filmstrip or arrow keys while preserving the adjustment panel and zoom state. For example, Darktable’s edit interface uses a filmstrip along the bottom and side panels for tools, enabling photographers to scroll through images and tweak settings in one unified screen
docs.darktable.org
. Keyboard shortcuts should allow toggling views (e.g. “G” for grid, “D” for develop) similar to Lightroom for muscle memory consistency. This desktop-first, multi-panel architecture is well-suited to large monitors and maximizes speed by avoiding modal pop-ups or full screen transitions during editing.
<https://www.darktable.org/about/screenshots/>
Example of a professional RAW editor UI with a filmstrip for quick image switching, side panels for history and adjustments, and a before/after compare slider. Such a layout minimizes context switching and supports fast keyboard-driven workflows
docs.darktable.org
darktable.org
.
Culling and Rating Workflow
Ingesting and culling 200–500 RAW images should be optimized for speed. Stillbytes should allow importing from a folder or memory card into the local library (IndexedDB) without delay. Following ingest, the culling interface should display the first image at full-screen or large preview size for rapid review. Navigation via arrow keys (or W/A/S/D as alternatives) lets photographers move through photos quickly
handandarrow.com
. To facilitate one-handed operation, support arrow keys or Spacebar for advancing images. Implement the common Lightroom trick of Auto-Advance: if Caps Lock is on, any rating or flagging action automatically moves to the next photo
fstoppers.com
. This way, culling becomes a single keystroke per image, as recommended in pro workflows
fstoppers.com
. For rating/flagging, adopt standard key mappings so pros feel at home. Flags: P = Pick (keeper), X = Reject, U = Unflag (clear flag)
fstoppers.com
. Star ratings: number keys 1–5 set that star count (and 0 to clear stars)
docs.darktable.org
. Color labels: keys 6, 7, 8, 9 assign Red, Yellow, Green, Blue labels respectively (matching Lightroom’s convention for color flagging)
fstoppers.com
. These keys mirror industry standards, ensuring photographers’ muscle memory carries over. For instance, in Lightroom Classic, “P” marks as pick, “X” rejects, and pressing a number like 3 sets three stars
fstoppers.com
. Stillbytes should also allow customizing shortcuts if possible (Lightroom doesn’t, but power-users often desire it
reddit.com
). To streamline culling further, include a filter toggle to hide rejected images and show only picks. After an initial pass, a user might hit a filter (e.g. “Show Picks Only”) to verify the selects. This mimics Photo Mechanic and Lightroom workflows where after marking keepers, the UI can display only those for a second review
handandarrow.com
. Performance is critical in culling: the app should display image previews instantly as photographers “breeze through” RAWs
trunghoangphotography.com
. Using embedded JPEG previews for initial review (as Photo Mechanic does) is a good practice to ensure zero lag when advancing images
reddit.com
handandarrow.com
. This offline-first app can cache decoded thumbnails or use embedded previews in IndexedDB to achieve lightning-fast flipping. Quick zoom for focus check should be supported with a single key or click (for example, hold Z or press Spacebar to toggle 100% zoom under the cursor). This lets a photographer check critical sharpness on a subject’s eyes during culling without leaving the flow. After culling, selected images remain in the catalog for detailed editing, while rejects could be filtered out or removed as the user decides (perhaps offering a “Delete All Rejected” action). Overall, the culling stage should feel efficient and mostly keyboard-driven, with minimal mouse need, reflecting the best practices of fast workflow tools like Photo Mechanic and Lightroom
reddit.com
handandarrow.com
.
Editing Panel and Adjustment Controls
For the Adjustment Panel, Stillbytes should follow familiar conventions for pro photo editors. A right-hand sidebar (for LTR locales) is recommended to host grouped adjustments in a vertical stack (similar to Lightroom’s Develop panel). Use an accordion-style layout where sections like Basic, Tone Curve, HSL/Color, Color Grading, Detail, Lens Corrections, etc., can be expanded or collapsed. This is the norm in Lightroom Classic: one scrollable column with collapsible sections for each category of adjustment. An accordion has the advantage of exposing multiple groups at once (if the user opens them) without switching modes, which is faster for experienced users than separate tabs. By contrast, Capture One employs a tabbed tool interface (e.g. Exposure tab, Color tab, etc.), which can organize tools but requires extra clicks to switch categories. Given our target users’ Lightroom muscle memory, an accordion single-panel approach will feel more natural and reduce context switching. Inside each adjustment section, use sliders with numeric input boxes for most settings, following industry UI norms. Sliders provide easy, interactive control for approximate adjustments, while accompanying numeric fields allow precise tuning or direct value entry
nngroup.com
. For example, Exposure might range ±5 stops – a slider lets the user drag to brighten/darken and the exact exposure value is shown numerically (which the user can type or fine-tune with arrow keys). This combined slider+number design is standard in Lightroom, Capture One, and Darktable, balancing exploration vs. precision
nngroup.com
nngroup.com
. Include tooltips or visible value readouts on slider hover so users know the current value and can reset easily (e.g. double-click slider label resets to default, as in Lightroom). Each adjustment type should use the UI control best suited for it, consistent with pro apps:
Exposure, Contrast, White Balance, Highlights/Shadows: Use simple linear sliders (with a numeric box) because these have defined ranges and immediate visual impact. Sliders work well when users need relative adjustments and can see real-time feedback
nngroup.com
. Ensure changes render under ~100ms for smooth feedback
nngroup.com
 (the canvas edit engine must be optimized here).
Tone Curve: Provide a graphical curve editor. Pros expect a visual curve tool for fine tonal adjustments. This could coexist with sliders for parametric regions (as Lightroom offers in its Tone Curve panel: parametric Highlights/Lights/Darks/Shadows sliders and a point curve graph). The curve UI lets users add anchor points and drag, which is essential for complex tone mapping
nngroup.com
. Incorporate multiple curve modes if possible (RGB composite curve and individual R, G, B channel curves), as high-end users often use them for color grading.
HSL (Hue, Saturation, Luminance): A common design is a section with 8 color sliders or a tabbed interface within HSL (Lightroom’s HSL panel can be toggled to adjust by Hue, by Saturation, etc.). A straightforward approach is an HSL section listing colors (red, orange, yellow, green, aqua, blue, purple, magenta) each with three sliders for H, S, L – or separate subsections for each aspect. Sliders are fine here, but also consider a targeted adjustment tool (a little crosshair icon that you can click on the image and drag up/down to adjust the corresponding color’s value). Lightroom and Capture One include such a feature to let users intuitively tune a color by directly interacting with the photo. This could be a later enhancement, but the UI should plan space for it in the HSL section.
Color Grading / Split Toning: Many modern editors have moved to a 3-wheel color grading UI (shadows, midtones, highlights color wheels) with a fourth master wheel. Stillbytes should include a Color Grading panel with three color wheels, as photographers coming from Lightroom Classic’s “Color Grading” panel or Capture One’s “Color Balance” tool will expect it. Each wheel allows selecting a hue (via a circular gradient control) and adjusting its saturation (distance from center) and luminance (often a separate slider). Ensure numeric inputs for those values as well, for precision. This graphical wheel UI is more intuitive for color tinting than three separate sliders, and it reflects what pros are used to
nngroup.com
 (Lightroom uses virtual “knob” dials for color wheels, whereas Capture One uses similar wheels – either approach is acceptable if implemented with mouse-friendly behavior).
Other settings (Detail, etc.): Sharpening, Noise Reduction can be sliders; Lens corrections might be checkboxes plus sliders (e.g. checkbox to enable profile correction, slider for vignette control); Cropping could be an overlay tool rather than in the side panel (perhaps a toolbar icon to activate a crop mode with adjustable rectangle on the image).
Use icons or labels consistently and consider small on/off toggles for each section. Lightroom, for instance, has an on/off switch for each panel (so you can see the effect of just that group of adjustments). This can be very useful for advanced users to quickly compare the effect of, say, the Tone Curve alone by toggling that section on/off. Also, grouping advanced tools: initially, Stillbytes might ship with just a Basic panel (exposure, contrast, white balance, basic color) and perhaps one or two others. As more advanced tools (HSL, Curves, Color Grading, etc.) are added in later phases, the UI can expand the sidebar list. If too many panels accumulate, module grouping or collapsible sub-sections can help (Darktable lets users configure module groups or a “favorites” quick access panel for frequently used adjustments). However, to start, a single scrollable column with key tools in a logical order will suffice and mirror Lightroom’s highly successful design
darktable.org
darktable.org
. Numeric input vs. sliders: Always display the current value numerically next to sliders. Users often want to type exact values (e.g. “+10” Tint or a precise Kelvin white balance). Also allow incremental adjustment via keyboard (for instance, when a slider handle is focused or on mouse hover, pressing Up/Down or +/- keys adjust by small amounts; with Shift for larger increments). This matches Lightroom’s behavior (Shift+drag for finer slider increments
community.adobe.com
) and gives pros fine control. In summary, the adjustment panel should feel instantly familiar: a vertical stack of collapsible sections, each containing intuitive controls (mostly sliders with numeric fields, plus occasional specialized widgets like curves or color wheels), providing both quick visual tweaking and precise numeric control as needed
nngroup.com
.
Before/After Comparison Tools
Professional photographers need to check their edits against the original frequently. Stillbytes should implement a Before/After view with multiple modes: a quick toggle and a side-by-side comparison. The fastest method is a keyboard toggle that switches the main preview between the current edited state and the original (un-edited) image. Lightroom Classic uses the \ (backslash) key to do exactly this – pressing \ reverts the preview to the “Before” (usually the image as imported) and pressing it again returns to “After”
lightroomqueen.com
. Stillbytes should have a similar one-key toggle (e.g. \ or perhaps Y depending on what’s free) for instant before/after. This lets users keep their hands on the keyboard and quickly gauge the overall impact of all edits. Additionally, a side-by-side or split view is valuable for detailed comparisons. Lightroom’s Y key toggles a side-by-side before/after view
lightroomqueen.com
. Stillbytes can offer a split view with a draggable divider down the middle of the image (one side before, the other side after) – this is useful to inspect changes in a particular area (the user can drag the divider across to compare specific parts of the photo). Darktable’s snapshot feature effectively achieves this by overlaying a saved before snapshot and allowing a swipe comparison
darktable.org
. We can implement a “Compare” mode where a vertical (or horizontal) slider is present; the user can click and drag it to reveal more or less of the “before” image
darktable.org
. This mode might be triggered by a toolbar button or a secondary shortcut (Y for side-by-side, Shift+Y for split overlay, for example). For speed, consider a press-and-hold behavior: e.g. holding down a key (perhaps O for “Original” or just holding down the \ key) shows the unedited image only while the key is pressed, and releasing it returns to the edited view. This press-and-hold paradigm is common in mobile editors and some desktop plugins, providing a momentary peek without fully toggling mode. If implementation is straightforward, it can complement the toggle – though even just a quick toggle key is sufficient for most pro workflows. The chosen methods should aim to be non-intrusive and fast. A small “Before/After” icon could live in the toolbar to click and cycle through compare modes (single view, side-by-side split, etc.), but the primary usage will be via shortcuts for seasoned users. By Phase 3 (when more advanced features are in place), having at least a before/after toggle and one split/side-by-side option will be important. This helps users confidently evaluate their edits and is considered standard in professional editing apps (Lightroom, Capture One, Darktable all have some implementation of this
lightroomqueen.com
darktable.org
).
Edit History and Non-Destructive Undo/Redo
Stillbytes is an offline, non-destructive editor, storing edit operations as a stack (history) per image. A clear History panel is recommended so users can visualize and navigate the edit stack. Lightroom Classic provides a running history list: every adjustment or tool use is listed, and clicking an entry reverts the image to that state
support.captureone.com
. Darktable similarly shows a “history stack” list in its left panel, with each module’s state at each step, and even allows renaming or compressing history steps
darktable.org
. Stillbytes should include a History panel (perhaps on the left side of the Edit view, opposite the adjustment panel) that lists each edit operation (e.g. “Exposure +1”, “Cropped”, “Contrast +10”, etc.). Users can click on any point to roll back to that state – and the stack of later edits remains accessible (just as in LR, you can click an earlier step, then go back to the latest by clicking the bottom entry). This visual timeline of edits greatly improves confidence in experimentation, since the photographer can always step back if an edit goes awry
support.captureone.com
. Undo/Redo shortcuts must be implemented (standard Ctrl+Z / Ctrl+Y on Windows, Cmd+Z / Cmd+Shift+Z on Mac). These let users step backward or forward one edit at a time. However, having the clickable history is even more powerful for non-linear navigation (jumping back multiple steps with one click). Note that not all pro tools have a visible history list (Capture One notably lacks it and relies only on sequential undo, which users often criticize
support.captureone.com
support.captureone.com
). By providing a history panel, Stillbytes can offer an advantage in usability. It’s important to clarify that since all edits are non-destructive, earlier steps can be revisited without permanent loss of later edits (unless the user starts editing from that earlier point, which would branch the history). A simple model is to treat history as linear (no branching), and if the user “undoes” and then makes a new change, truncate the history beyond that point – this is how Lightroom works. To complement history, consider Snapshots/Versions for advanced use. A snapshot is a named save of the current edit state that users can recall later (Lightroom has a Snapshots panel for this). This is useful to compare two different edit approaches on the same image. Capture One uses a concept of Variants (virtual copies of an image with different edits) as a workaround since it has no history list
support.captureone.com
. In Stillbytes, we could implement a lightweight snapshot feature in the History panel: a button “Take Snapshot” that records the current state (e.g. “Snapshot 1 – B&W version”). Clicking a snapshot reverts the image to that state (without wiping the underlying history). Snapshots could be listed above the history entries for easy access
darktable.org
. This is a nice-to-have that might come in Phase 3 once the basic history/undo is solid. The History panel should also support copy/paste of edits via the history stack (ties into batch editing). For instance, Darktable allows copying the history stack from one image and pasting to others
docs.darktable.org
. We will cover this in the batch editing section. Internally, the history entries will correspond to the operations stored in IndexedDB (edit stack), so the UI simply reflects those. Each entry can show the operation name and perhaps the parameter change (e.g. “Exposure +1.00”). We should also provide a reset to original button (like Lightroom’s Reset), which essentially rolls back to the first history state (original import with no edits). One more advanced concept: because Stillbytes is non-destructive, it might consider a history “compress” function (Darktable has this
docs.darktable.org
). Compressing history flattens consecutive steps or removes no-op toggles, etc., mainly to tidy up. This is optional and perhaps not needed until later. Initially, simply recording every change and letting the user undo is sufficient. In summary, a visible history stack gives pros confidence and mirrors Lightroom Classic behavior
support.captureone.com
. Capture One users who migrate will appreciate it, since many C1 users have requested such a feature and currently miss it
support.captureone.com
. Along with a robust undo/redo, this History UX will support the non-destructive editing model clearly.
Batch Editing and Preset Sync
Photographers often need to apply the same adjustments to many photos – for example, syncing a common white balance across a set, or copying a “look” from one image to an entire shoot. In Stillbytes, we should implement familiar copy/paste and sync workflows for edits:
Copy/Paste Adjustments: The user can copy the edit settings from the currently edited photo and paste them to one or more selected photos. Provide a “Copy Settings” command (e.g. a button in the UI or Ctrl+Shift+C / Cmd+Shift+C as in Lightroom)
docs.darktable.org
. When triggered, show a Copy Settings dialog that lists all categories of adjustments with checkboxes
helpx.adobe.com
. This lets the photographer choose which adjustments to copy – e.g. maybe they want to copy only the tone and color changes but not the crop or spot removals. Lightroom Classic’s dialog includes groups like Basic Tone, Color Grading, Crop, Spot Removal, etc., which can be individually checked
helpx.adobe.com
. We should include a “Select All / None” option and perhaps presets like “Modified Only” (only the adjustments that differ from default on that photo)
helpx.adobe.com
. After copying, the user can select target images (in the grid or filmstrip) and use “Paste Settings” (Ctrl+Shift+V) to apply. If multiple images are selected, paste should apply to all of them
helpx.adobe.com
.
Sync on Multiple Selection (Auto Sync): Alternatively, when multiple images are selected in the Edit view, allow adjusting one image and syncing in real-time to the others. Lightroom does this via an “Auto Sync” toggle – if enabled and a group of photos is selected, any slider change you make on the primary photo propagates to all selected. This can be dangerous if left on unintentionally, so a safer approach is a manual sync: e.g. a “Sync” button that applies the current photo’s settings to the others. The Sync button would essentially do the copy-paste in one click using the previously set selection of which adjustments to include. This is exactly Lightroom’s “Sync Settings” workflow: you click Sync, get the same dialog of checkboxes (unless you have a previous config saved), then apply to all selected. Stillbytes can implement this in Phase 2 for batch efficiency.
Presets on Multiple Images: If the user applies a saved preset (we will need a Presets system eventually) to a selection of photos, all of them should get those preset adjustments. This is effectively a specialized batch copy-paste as well. For early implementation, focusing on direct copy/sync is enough, but designing the system such that applying a preset to many is possible will be good for Phase 2.
Partial sync (tone-only, color-only, etc.) is critical. Photographers often need to sync just a subset of edits. For example, they might correct white balance and exposure on one image and then sync only those to a batch, while not touching cropping or local adjustments. Lightroom and Darktable handle this by letting the user choose which settings to paste
helpx.adobe.com
docs.darktable.org
. Darktable’s selective copy/paste explicitly allows choosing parts of the history stack to apply
docs.darktable.org
docs.darktable.org
. Stillbytes should present categories (since average users think in terms of “settings”, not low-level operations). Under the hood, we can map each operation in the history to a category (e.g. Exposure slider change → “Basic Tone” category), and the dialog just toggles those operations on/off for the copy. To illustrate, Ctrl+Shift+C in Darktable opens a dialog to choose which modules from the history to copy; Ctrl+Shift+V does similar for paste
docs.darktable.org
. We might implement the UI similarly or more simplified like Lightroom’s checkboxes. In either case, supporting partial sync ensures the workflow is flexible. Applying to multiple files: When in grid view, allowing multi-selection and a right-click “Paste Settings” or menu “Sync Settings” is useful. Also, a global preset application (select images → apply preset X) can achieve batch edits quickly for commonly used styles. Additionally, batch rating or tagging should be possible in grid view (e.g. select 50 images and hit “5” to mark all five-star). This is part of batch operations too, though simpler. The UI should indicate when multiple photos are selected (perhaps a “[N] photos selected” label) and warn if the user tries to go to Develop with many selected without intending to sync (Lightroom famously has that “Auto Sync” toggle to prevent accidental group edits). Stillbytes could handle it by requiring an explicit “Sync” action for multiple targets, which is safer. Finally, consider the use case of consistent edits across a shoot: a user might fully edit one representative photo and then propagate those edits to all selected similar photos. With the above features, they would: edit one photo → click Copy (choose all relevant settings) → select others → click Paste. This should result in identical adjustments on the others, which is exactly what pros expect. For advanced control, Darktable even has an option to append vs overwrite when pasting histories (allowing you to add adjustments on top of existing ones or replace them entirely)
docs.darktable.org
. For simplicity, Stillbytes can default to overwrite (meaning the target images will match exactly the source’s adjustments for the chosen settings). Overwrite is what Lightroom does – it replaces those settings. Append might be beyond our needs unless we allow multiple instances of certain adjustments. All these batch edit functions should be optimized for offline use – since everything is local, applying settings to 100 photos should be reasonably quick (we can update the database entries and mark them for rendering as needed). A progress indicator might be needed if applying heavy edits to many images at once, but ideally it’s fast enough not to require a long wait. In summary, robust copy/sync features with selective adjustments will significantly boost workflow for wedding and event photographers who edit in volume
docs.darktable.org
docs.darktable.org
.
Export Workflow and Presets
Exporting is where the finished photos are rendered out of Stillbytes’s local database into standard image files (JPEG, TIFF, etc.) for clients or web use. Export UI should accommodate both single-image export and batch export of many images, with options comparable to Lightroom’s Export dialog and Capture One’s Process Recipes:
Basic export dialog: In Phase 2, implement a modal or side-panel form for export settings. Key options:
File format (JPEG, TIFF, PNG, possibly original+XMP or DNG if supporting that).
Quality/Compression for lossy formats (JPEG quality slider).
Resolution/Size: ability to scale images on export by dimensions or long edge, and set DPI if relevant.
Color Space / ICC Profile: allow choosing the output color profile. Default to sRGB for most exports (web/client use) but offer Adobe RGB, ProPhoto, etc., for those who need it
support.captureone.com
. Also for TIFF allow 16-bit vs 8-bit choice.
Output Folder and File Naming: let user choose where files go and naming scheme (filename template). Many pros use custom names or sequences, so include tokens like original filename, date, custom text, etc., if possible, or at least a simple suffix/prefix system initially.
Export Presets: Provide the ability to save these settings as presets (e.g. “Full-size JPEG sRGB”, “Web 2048px Watermarked”, etc.). This way, a user can quickly select a preset and not have to re-enter settings each time.
Metadata inclusion: Offer checkboxes to include or exclude certain metadata in exports. For example, “Include EXIF metadata” (on by default), “Remove location info”, or “Include copyright info”. Pros sometimes strip certain data when sharing publicly. At minimum, a simple toggle to export with full metadata vs. strip all metadata can be provided initially. More granular control (like Lightroom’s option to remove person info, location, etc.) can be added later. Also, if using watermarks or overlays, that could be an advanced feature beyond initial scope.
For batch export, the user can select multiple photos (or an entire album) and invoke export once, with the above settings applying to all selected. If a naming collision would occur, auto-generate unique names or enforce a naming template that uses something like filename or sequence number. Export Presets & Multiple Recipes: In advanced workflows, tools like Capture One allow running multiple export recipes in one go (e.g. generate a full-res TIFF and a scaled JPEG in one batch)
support.captureone.com
. As a phase 2/3 feature, we can allow selecting multiple presets at once to apply. However, to start, one set of settings at a time is fine, with the user repeating export for different outputs. The preset system should be flexible enough to later allow multi-select. Background export: Exports should run in the background so the user can continue editing. Perhaps a small export queue indicator could show progress. This is common: Lightroom’s export runs in background threads and shows a progress bar. Since Stillbytes is Electron-based and offline, we can spawn a web worker or use a separate process to render images (using the canvas engine) so the UI remains responsive. The export dialog can close upon starting export, and a status bar item or notification can indicate when done. ICC profiles: Ensure the chosen profile is applied during export conversion. E.g. if user picks Adobe RGB, the exported file’s color values should be in that color space (we may need to use a library or browser canvas color management to convert from internal working profile to output profile). Many pros will simply use sRGB for client delivery and AdobeRGB for prints. This is a key expectation to communicate in the UI (e.g. a dropdown for “Output Color Space” – sRGB default
support.captureone.com
). Quality assurance: We should allow a quick way to export a single image at full quality (like a “Export -> Original format” which could just export the original RAW’s preview or a full-size JPEG with all edits). But since edits must be applied, typically we’ll be rendering anyway. Exporting with sidecar/metadata: If users need, we might include an option to export XMP sidecars alongside images (for example, export original RAW + an XMP of edits, though that’s more for handing off to other software – not a typical deliverable to clients). More relevant is including metadata like IPTC copyright, which could be set somewhere in the UI (perhaps an “Export metadata template” or simply pulling from the image’s metadata fields if we support editing those). Multiple export tasks: For Phase 2, a simple one-at-a-time export is fine, with a queue if the user triggers another before first completes. Phase 3 could bring a more elaborate export manager where multiple recipes/presets can be queued or run in parallel if system allows. By designing the export interface with presets, we ensure efficiency for repeating tasks. A wedding photographer might configure a preset for “Full Res JPEG, sRGB, 90% quality, rename with client name”, and another preset for “Web upload, 2048px, watermark”. Stillbytes should allow them to define those once and reuse. This level of customization and batch capability is expected in pro workflows
support.captureone.com
. In communicating to the user, emphasize that all exports are local – files are saved to their chosen folder on disk, with no cloud upload. This ties into the local-first messaging.
Offline-First Privacy Indicators
One of Stillbytes’s core advantages is being local-first and privacy-focused (no cloud, no account). We need to convey this clearly in the UI/UX without disrupting workflow. A few subtle but reassuring patterns:
No login requirement: From the moment the app launches, users can notice there’s no “Sign In” – this itself signals everything is local. We can mention “Offline Mode” or similar on the welcome screen. For example, an initial setup dialog might say “Welcome to Stillbytes – An offline RAW editor (no cloud account required).” This sets the tone in one sentence.
Icons or badges: A small icon (like a cloud with a slash) can be placed in the footer or title bar with a tooltip “Working locally. No data leaves your computer.” This provides a constant reminder of privacy without a full dialog. Alternatively, a label “Local” or “Offline” somewhere visible can reassure users.
Preferences/About note: In an “About” or “Preferences” section, explicitly state “Stillbytes is an offline-first application. Your photos and edits never leave your device.” This is important for transparency. It can be phrased succinctly and positively (privacy as a feature).
On import: When importing photos, we could include a checkbox or note “☑ Keep photos local (Stillbytes does not upload images)”. Even though there is no other option (since cloud isn’t built-in), stating it at a relevant moment reinforces the message.
Marketing UI: Perhaps a non-intrusive banner or tagline in the UI shell: e.g. window title “Stillbytes – Local RAW Editor”. Or a one-time notification like “You’re all set! Remember, Stillbytes works entirely offline – your images stay on this computer.”
The key is to avoid overexplaining or forcing the user to dismiss a lot of text. Instead, a concise statement at first run and small visual cues thereafter are sufficient. The language used by other privacy-first apps can serve as a guide. For instance, a Linux app review notes: “Schedule takes a privacy-first, local-first approach. There are no accounts to create, and nothing gets stored in a cloud. It works perfectly offline...”
itsfoss.com
. We can mirror this tone in our UI messaging. Perhaps in the welcome screen: “100% Local – No cloud storage or account needed. Your files never leave your machine.” – in a friendly tone. We should also avoid confusion: Some users might expect cloud sync if they’re used to Lightroom CC or mobile apps. To preempt this, explicitly label the product as “Stillbytes (Local Edition)” or include a tagline in the website/download page about being offline. In-app, making the user feel secure about privacy will build trust. Finally, ensure any network operations (like checking updates) are opt-in or clearly separated so the user truly feels it’s offline. Given no cloud features are planned, our UI can wholeheartedly focus on local content. In summary, prominently communicate “No Cloud, All Local” via brief UI text and maybe an icon, especially at onboarding. Thereafter, the absence of any online sync dialogs or login forms will itself reinforce the local-first nature, and users will appreciate the clarity that their data stays private
itsfoss.com
.
XMP Sidecar Integration and Interoperability
Professional workflows often involve moving images or metadata between software. Many tools use XMP sidecar files to store ratings, tags, and edit metadata alongside RAW files for interoperability. Stillbytes should support XMP sidecars in a way that fits its offline nature:
Reading XMP on import: If a RAW file has an adjacent .xmp (for example, from Photo Mechanic or Lightroom) containing ratings, color labels, or keyword tags, Stillbytes should read those and apply them to the image’s metadata. This ensures, for instance, that a photographer who culled and rated photos in Photo Mechanic sees the same star ratings upon importing into Stillbytes. Common XMP fields like Rating (stars 1-5), Label (color label names), Flag/Pick (often an XMP flag or Lightroom’s custom namespace) should be mapped and supported. This is important for interoperability in pro environments.
Writing XMP: Provide an option to write XMP sidecars for RAW images that store metadata and perhaps edit settings. There are a few approaches in the industry:
Lightroom Classic does not auto-write XMP by default (edits live in its catalog), but users can manually trigger “Save Metadata to File” or enable auto-write in preferences. When enabled, every change updates the .xmp file next to the RAW
docs.darktable.org
. This allows external tools (or a backup) to have those edits.
Darktable always writes an .xmp sidecar with the full history stack for each image, updating it whenever edits change
docs.darktable.org
. This is truly a local-first approach; the sidecar serves as both backup and interoperability mechanism (though only Darktable can fully use its contents).
Capture One can read/write basic XMP metadata (ratings, tags) but not its edit settings (which remain proprietary).
Photo Mechanic writes out metadata changes (like captions, ratings) immediately to XMP so that downstream apps can see them
handandarrow.com
.
For Stillbytes, since it uses IndexedDB as the primary store, we might adopt a hybrid approach: automatically write out an XMP file whenever a user changes rating/flag, so that this crucial info is visible externally. We can also consider writing some representation of edit settings (perhaps Adobe’s develop settings schema for basic adjustments, to be somewhat Lightroom-compatible). However, matching Lightroom’s XMP schema fully is complex and not all tools would interpret it. At minimum, writing standard EXIF/IPTC fields (rating, label, keywords) to XMP ensures interoperability for DAM (Digital Asset Management) purposes. We should expose a preference: “Automatically save edits and metadata to XMP sidecars”. If enabled, each edit operation triggers an update to the .xmp file for that photo (on disk). This provides live backup of the non-destructive edits – a user could re-import the RAW+XMP into another instance of Stillbytes or possibly Lightroom and not start from scratch. Darktable does this by default and notes it in their docs
docs.darktable.org
, favoring always-up-to-date sidecars as a safety measure. We can do similarly, as performance overhead is low for writing small XML files locally. If the user prefers not to clutter folders with sidecars, they could turn it off (then Stillbytes would behave like Lightroom by default, storing edits only internally until explicitly saved). When to write sidecars: Ideally on each significant change (perhaps throttle to avoid too-frequent disk writes if a slider is being dragged continuously). Also write them on image import if any default metadata is added, and on exit (ensure all latest edits are flushed to XMP). What to include:
Ratings, flags, labels – in standard XMP tags (e.g. xmp:Rating, lr:PickStatus, photomechanic:ColorClass etc., or simply the Adobe schema ones for maximum compatibility) so that if the user opens Adobe Bridge or Lightroom, those show up.
Develop settings – This is trickier. One approach: write Stillbytes’ edit stack as a custom XMP schema (like sb:EditStack with operations). Other apps won’t understand it, but it serves as a backup for Stillbytes itself. Alternatively, for overlapping basic adjustments, we could write analogous Lightroom develop settings (Adobe’s XMP namespace for Develop). For example, if Stillbytes has Exposure +1, write crs:Exposure2012 = +1.0 (the Camera Raw schema). This might allow partial transfer of edits if someone opened the file in LR (though differences in rendering might make it imperfect). This might be beyond scope for now, but keeping the door open is wise. At least, storing our own edits in the XMP (for backup) is good practice
docs.darktable.org
, even if others ignore them.
Interoperability expectations: Photographers expect that simple metadata (stars, flags) carry over across software. We should meet that. They usually do not expect different editors’ adjustments to translate (each raw editor has its own rendering engine). So it’s okay if Stillbytes edits only fully show up in Stillbytes. But not losing ratings or keywords when switching apps is important. Also, if Stillbytes can respect XMP from Photo Mechanic or Lightroom, it fits into existing workflows. For example, a wedding photographer might ingest and cull in Photo Mechanic (rate and tag there), then open the same folder in Stillbytes – all their ratings should be visible (via reading the XMP sidecars). And conversely, if they export or deliver files or even use Bridge later, having those ratings written out by Stillbytes ensures continuity. Sidecar timing: We should clarify in the UI that edits are always stored in the database, and XMP saving can be optional. Perhaps in the preferences or in a tooltip on the “Save to XMP” toggle, explain: “XMP sidecars store your edits and metadata for use in other programs. Stillbytes can auto-save these after each edit.” This way, technically-minded users understand the benefit. The default could be ON to align with the no-cloud, user-owns-data philosophy (like Darktable’s default
docs.darktable.org
). If performance or user disk clutter is a concern, default off and allow manual save (but manual is easy to forget). In summary, support XMP sidecars robustly. Write them automatically (or on-demand) with key metadata so Stillbytes plays nicely with other tools. Emphasize that no cloud is involved – these sidecars are local files next to your RAWs, adhering to industry standards. This approach ensures that Stillbytes can slot into a professional’s workflow alongside other apps, and serves as a form of open data portability, which advanced users will appreciate
docs.darktable.org
.
Keyboard Shortcuts (macOS & Windows)
A core part of the Stillbytes UX will be extensive keyboard shortcut support for efficiency. Below is a map of essential shortcuts, with both Windows (Ctrl/Alt) and macOS (Cmd/Option) notations where they differ:
View Navigation:
G – Go to Grid (Library) view.
D – Go to Develop (Edit) view of selected photo. (Like Lightroom’s G/D keys)
E – (In grid) Quick “Loupe” view (single photo fullscreen) without switching to edit mode (optional, could be same as D).
Tab – Toggle side panels on/off (common in Lightroom to hide UI for larger preview).
F – Fullscreen preview of the image (hides UI, like Lightroom’s full screen).
Image Navigation & Selection:
Arrow Left/Right – Move to previous/next photo (works in grid selection and in filmstrip view)
handandarrow.com
.
Arrow Up/Down – In grid, move selection up/down; in filmstrip or culling, possibly same as left/right if linear. (Photo Mechanic uses up/down for next as well
handandarrow.com
, but we can stick to left/right to avoid confusion).
Spacebar – In grid: toggle between grid and loupe (commonly space in Lightroom zooms, but since we use Z below, space could be repurposed). We can decide either Space = zoom in/out 100% (like Photo Mechanic uses a quick zoom) or Space = switch view. This one can be user-configurable.
Enter or Double-Click – Open selected photo in Edit view (from grid). Esc – return to Grid from Edit (or close any modal).
Culling and Rating:
P – Flag as Pick (mark as keeper)
fstoppers.com
.
X – Flag as Rejected
fstoppers.com
.
U – Unflag (clear pick/reject)
fstoppers.com
.
1–5 – Assign 1–5 star rating
docs.darktable.org
 (0 to remove rating). These should work in both grid and edit views for convenience.
6–9 – Assign color label (6=Red, 7=Yellow, 8=Green, 9=Blue)
fstoppers.com
. (We can use 0 or None to clear color label, Lightroom uses 0 for no rating, color labels are toggled by repeating the number or via menu).
Caps Lock – When on, enable Auto-Advance so any rating or flagging auto-moves to next photo
fstoppers.com
. (Also have an explicit setting in menus “Auto Advance after Rating”).
Shift + [number] – (If feasible) Rate and auto-advance. Lightroom supports Shift+number to rate and move next as well
helpx.adobe.com
. If Caps Lock approach is unreliable for some, this is an alternative.
Ctrl/Cmd + A – Select All (in grid)
docs.darktable.org
. Useful for batch rating or export.
Ctrl/Cmd + Click / Shift + Click – Standard multi-select of specific images or range in grid.
Alt/Option + number – Possibly map to an alternate meaning (Photo Mechanic uses Ctrl+number for color class in some configs
forums.camerabits.com
, but we may not need this if basic 6-9 cover it).
Editing Adjustments: (Many of these will be interactive with whichever panel control is active, but some global toggles or tools)
Ctrl/Cmd + Z – Undo last edit
support.captureone.com
.
Ctrl/Cmd + Y (or Ctrl + Shift + Z on Mac) – Redo edit
support.captureone.com
.
Reset (perhaps Ctrl+R or Shift+R) – Reset current photo’s edits to original (like Lightroom’s Reset button). Could also tie to double-clicking sliders (resets that slider). But a full reset shortcut is handy.
Before/After: \ – Toggle before/after preview
lightroomqueen.com
.
Y – Cycle compare view (perhaps first press side-by-side before/after, second press split, third press back to normal). Alternatively, Y = side-by-side, Shift+Y = split overlay.
Zoom: Z – Toggle zoom between fit and 100% (common in Photoshop/Bridge, and Photo Mechanic’s shortcut).
Ctrl + +/- (Cmd + +/- on Mac) – Zoom in/out increments (if implementing zoom levels).
Hold Space (or H) – Temporarily switch to Hand tool for panning when zoomed (spacebar as a pan tool is Photoshop convention).
Crop Tool: e.g. C – Enter crop/rotate mode. Once in crop, Enter/Return to apply crop, Esc to cancel.
Straighten Tool: e.g. A (as in LR) for straighten (or we integrate with crop UI).
Spot Removal/Healing: e.g. B for brush/heal tool (just planning ahead if those tools added).
Exposure slider adjustment via keys could be tricky, but perhaps allow +/- keys to bump exposure in small increments when not typing in a field (maybe Ctrl + +/- for exposure specifically if we assign that? Or have a quick exposure boost shortcut like ] and [ to bump exposure by 1/3 stop).
Copy/Paste & Sync:
Ctrl/Cmd + Shift + C – Copy current photo’s adjustment settings (open the selective copy dialog)
docs.darktable.org
.
Ctrl/Cmd + Shift + V – Paste settings to selected photo(s)
docs.darktable.org
. Possibly open a dialog for selective paste if we want to confirm which settings, or directly apply if using last selection. Darktable uses the same shortcuts
docs.darktable.org
.
Ctrl/Cmd + C / V – We might avoid plain Ctrl+C for copy settings to prevent conflict with text copy. However, Darktable binds Ctrl+C to full copy and Ctrl+Shift+C to selective copy
docs.darktable.org
, which is an option. But to avoid confusion, using the Shift variants for our purpose is fine.
Ctrl/Cmd + Shift + S – “Sync” or copy to all selected, depending on how we implement (or we just rely on copy then paste to selection to achieve sync).
Ctrl/Cmd + Z/Y – As mentioned, undo/redo (works across multiple photos too if we consider batch undo of last batch paste, etc.).
Ctrl/Cmd + D – Possibly “Duplicate” virtual copy of image (if we allow virtual copies; Darktable uses Ctrl+D to duplicate image version
docs.darktable.org
).
Export:
Ctrl/Cmd + Shift + E – Open Export dialog (Lightroom uses this).
After setting up, hitting Enter in dialog triggers export. No specific global shortcut for “export with last settings” but we could allow Ctrl+Alt+Shift+E to repeat last export preset (Lightroom has “Export with Previous” as a menu, which could get a shortcut).
Misc:
Ctrl/Cmd + H – Hide/unhide filmstrip (or toggle info overlay). Or F6 in Lightroom toggles filmstrip, F5 toggles top bar, etc. We can allow some function keys or assign to something like Tab or a combination. Lightroom has a whole set of toggle UI via function keys which advanced users appreciate (F5/F6/F7/F8 for top, bottom, left, right panels respectively). We could consider similar mappings.
Ctrl/Cmd + P – Perhaps open Preferences (if we have a preferences dialog). On Mac it might be under the app menu anyway.
Ctrl/Cmd + Q – Quit.
Ctrl/Cmd + S – Quick save metadata/XMP (if we implement manual save). Could write sidecar immediately.
Ctrl/Cmd + Shift + N – Create new album/collection (future library management if any).
For macOS, typically replace Ctrl with Command and Alt with Option for equivalents. We should list both in documentation (e.g. “Copy Settings – Ctrl+Shift+C (Windows) or Cmd+Shift+C (Mac)”). Many shortcuts like letters or numbers remain the same across platforms, except those involving Ctrl/Cmd. The above set covers the core workflow: navigation, culling, editing, syncing, exporting, and toggling views. These should be implementable in Electron (listening for key events). It’s crucial to allow user to perform 90% of actions via keyboard for speed – seasoned pros often have one hand on keyboard, one on mouse for sliders, constantly. By Phase 3, we can also allow customizing shortcuts via a preferences UI or JSON config, because some users might want to rebind keys (for example, using Z/X for flags instead of P/X – Lightroom CC did that to be one-handed). But initially, stick to the industry defaults as they are well-known
reddit.com
. We will provide a reference cheat-sheet (maybe an online help or a dialog within app) listing all shortcuts, so users can learn and adapt quickly. Adhering to familiar patterns (like the Lightroom and Darktable examples cited) will make Stillbytes feel immediately comfortable to professionals.
Phased Implementation Roadmap
Finally, we outline the phased rollout plan, breaking down the above recommendations into three stages to deliver incrementally:
Phase 1: Core Library & Single-Photo Editing
Scope: Establish the fundamental workflow of importing, culling, basic editing on one photo at a time, and non-destructive storage of edits. Focus on the Grid view and Single Photo Edit view UI.
Gallery (Grid) View: Implement a thumbnail grid for browsing images. Include rating stars and flag overlays on thumbnails. Support multi-selection and basic filtering (e.g., filter by flagged, by rating). The grid is the hub for selecting images to edit or export.
Culling Tools: Enable full-screen/large preview mode for quickly cycling through images. Implement arrow key navigation, and the rating/flagging shortcuts (P/X/U, 1-5, etc.)
fstoppers.com
docs.darktable.org
. Add the Caps Lock auto-advance functionality for rapid culling
fstoppers.com
. Provide a simple filter toggle to “hide rejected” so photographers can quickly mark and then remove rejects from view
handandarrow.com
.
Import/Ingest: Allow adding folders of RAW files to the library (copying files is optional since we can operate in-place via IndexedDB references or small thumbs). Show an Import dialog where users select source and maybe apply initial metadata/preset (if any basic ones).
Single Photo Edit View: Set up the primary editing workspace. This includes the main canvas (rendered via the canvas edit engine), the right sidebar with an initial set of adjustment panels, and the filmstrip along the bottom for quick image switching
darktable.org
. In Phase 1, include the most essential adjustments in the panel:
Basic panel: Exposure, Contrast, White Balance (Temp/Tint), Highlights, Shadows, perhaps Blacks/Whites, Clarity/Texture if available. These cover the majority of simple global edits.
Crop/Rotate tool: Provide a way to crop and straighten images (could be a button that overlays guides on the canvas, with aspect ratio options).
Possibly Tone Curve (basic): If feasible, include a simple tone curve or at least a contrast curve preset (but this could wait to Phase 3).
Omit more advanced panels (HSL, Color Grading, etc.) until Phase 3 to keep UI lean initially.
Non-Destructive Edit Storage: Implement the edit history stack in IndexedDB for each photo. Phase 1 can store every operation and allow Undo/Redo via shortcuts, but the History panel UI itself (list of steps) can be rudimentary or hidden initially if time is short. At minimum, ensure undo/redo works and maybe display the current state name (e.g., “Editing…”). The underlying data model must support stacking operations, which will pave the way for the full History panel in Phase 3.
Before/After Toggle: Include the quick before/after toggle (backslash key) from the start, since it’s straightforward to show original vs edited
lightroomqueen.com
. A side-by-side compare view could be delayed until Phase 3 if needed.
Local-Only Indicator: From day one, have some UI text or icon indicating offline status (as discussed, e.g., “Local editing – No cloud” note). This phase might show it on the About screen or initial splash.
Keyboard Shortcuts Core: Implement the critical shortcuts for Phase 1 operations: rating flags, switching views (Grid/Edit), undo/redo, basic tool toggles, before/after, and copy/paste settings (even if paste will only apply to one image in Phase 1). Provide a reference (maybe a help menu listing them).
Minimal Export (Single Image): If possible, include a very basic export for a single photo – e.g., right-click a photo -> “Export JPEG” with minimal settings (perhaps full size, sRGB, default name). This ensures Phase 1 users have a way to get an edited image out. A full export dialog and batch export will come in Phase 2, so this can be rudimentary. Alternatively, communicate that export is coming and Phase 1 is for editing experimentation (if internal use). But ideally, even Phase 1 has at least a default export function for testing outputs.
Rationale: Phase 1 delivers the essential editing experience akin to Lightroom’s Library+Develop for a single image at a time. Photographers can import a batch, cull them, perform basic adjustments on selects, and preview before/after. By limiting to core tools, we keep the UI uncluttered and learn from user feedback on what to add next. This phase lays the groundwork (data models for images, edits, UI components) for more advanced batch features later. It’s immediately useful: one can complete a simple edit job entirely offline with this functionality (except high-volume export). The focus on desktop conventions (grid, side panels, familiar shortcuts) will attract our target pro users early and let them acclimate to Stillbytes with minimal friction.
Phase 2: Batch Operations and Export Enhancements
Scope: Build on the solid single-photo editing foundation by adding efficient batch processing capabilities and a robust export workflow. This phase is about handling volume: applying changes to many photos and outputting files in batches.
Batch Rating & Filtering: Extend the Grid view to support quick bulk actions. E.g., after culling, allow selecting a range of photos and pressing “5” to mark all as 5-stars, or “X” to reject en masse (if not already in Phase 1). Add more filter options (filter by star >= X, by picked only, by camera/lens metadata if needed). This helps photographers manage hundreds of images by group.
Copy/Paste & Sync Settings: Fully implement the Copy Settings dialog with checkboxes for which adjustments to copy
helpx.adobe.com
. The dialog appears on Ctrl+Shift+C (Cmd+Shift+C) and lists categories (exposure, crop, color, etc.) for selection. Implement Paste to multiple: if multiple images are highlighted in grid or filmstrip, pressing Paste (Ctrl+Shift+V) applies the copied adjustments to all of them
helpx.adobe.com
. Ensure things like append/overwrite logic are handled simply by overwriting the targets’ edit stack with the incoming adjustments (clearing their previous edits unless append is specifically intended).
Possibly include a “Sync” button in the Develop view UI: when multiple images are selected, a “Sync” could light up. Clicking it opens the same subset dialog to confirm which settings to sync, then applies. This gives a visual affordance rather than relying only on shortcuts.
Also support sync on import: some users might want to apply an import preset to all images – effectively copy a set of default adjustments (like a preset for their camera profile) to all. This could be a later addition or part of import dialog (apply preset X to imported images).
Presets System: Introduce the concept of develop presets. Users can save the current photo’s adjustments as a named preset (e.g., “Cool Cinematic Tone”) and later apply that preset to other photos. This is related to batch workflow because one can apply a preset to many files quickly. In the UI, have a Presets panel on the left side perhaps, listing saved presets. Applying a preset to multiple selected images in grid should be allowed (this is effectively a specialized batch copy). The preset creation dialog can also allow selecting which settings to include in the preset (like Lightroom does). This adds power for Phase 2 as users build their own styles and reuse them.
Export Dialog & Batch Export: Replace the minimal export with a full Export interface
helpx.adobe.com
. Design it as a dialog (or a side panel module) where the user can set format, quality, resizing, output location, naming, etc., as described in the Export Workflow section:
Provide a list of Export Presets on the left or top for one-click selection of common settings, and a button to save new presets after configuring options.
Support selecting multiple images and exporting them all in one go. If 300 photos are selected and the user hits Export with “JPEG, sRGB, 90% quality, rename series” settings, the app should iterate and export each. Show a progress bar for the batch. Possibly allow parallel processing if CPU/GPU can handle (but be mindful of system performance; maybe export 2-3 at a time).
If possible, implement multiple recipe export: allow checking multiple presets to run at once (like Capture One’s recipes
support.captureone.com
). For example, the user checks “High-res JPEG” and “Web JPEG” – each photo will then output two files (in different folders or with different suffixes). This is an advanced feature that could be Phase 3 if Phase 2 needs to limit complexity. At least ensure the architecture can loop through selected presets.
File naming templates: Provide basic tokens like {filename}, {counter}, {date} for renaming on export. Even just “OriginalName_export” or “CustomSequence” is useful. Over time, expand this.
Metadata options: Add checkboxes like “Include metadata” (if unchecked, strip all EXIF), “Include copyright info”. Use sane defaults (include everything except maybe location if privacy concerned).
ICC profile selection must be functional. Make sRGB default but allow others. Photographers delivering for print might choose Adobe RGB or even export TIFF in ProPhoto. The UI could warn if a wide-gamut profile is chosen for JPEG (since some clients may not handle them) but leave control in user’s hands.
Validate that exports match expected output (maybe in testing, ensure color profile is embedded, metadata according to checkboxes, etc.).
Export Queue & Notifications: Implement a simple background queue. Perhaps in the UI status bar show “Exporting 5 of 250…” with a cancel button if needed. When done, maybe toast a notification “Export completed: 250 files saved to /Exports/May15Wedding/”. This lets the user continue culling or editing other images while exports run.
Refine History/Undo for Batch: Ensure that if a batch paste is done, it’s treated as one composite action (so one undo can remove the batch paste from all, rather than requiring 300 undos – this might already be handled if we implement multi-image paste as a loop of single-image edits, but grouping them for undo could be beneficial). If too complex, at least allow undo on each image sequentially.
XMP Metadata Sync: In Phase 2, with rating and tagging stable, implement writing of XMP sidecars for those metadata changes. For example, if a user sets 50 images to 5-star and has “Write XMP” on, quickly write out those 50 XMP files with rating=5. Also if they change a caption or keyword (if we have metadata fields by Phase 2 – could be a simple IPTC metadata panel).
We might leave writing of full edit settings to Phase 3, but Phase 2 should handle at least ratings/flags so that any handoff between culling apps and Stillbytes is consistent.
User Feedback and Adjustments: By end of Phase 2, we’ll have lots of functionality. We should gather user feedback (perhaps from a closed beta with some photographers) to fine-tune UI/UX. Maybe shortcuts need tweaking, or performance on batch export needs optimizing – address those now before advanced features.
Rationale: Phase 2 adds the high-throughput capabilities that pros need: copying adjustments across many files and exporting en masse. This enables Stillbytes to handle an entire shoot’s workflow: e.g., import 400 RAWs, cull to 100 picks, batch-sync a preset or baseline edit to all, fine-tune a few, and export all finals in one go. That’s the everyday use-case for wedding and event photographers, so delivering this in Phase 2 means Stillbytes becomes a viable replacement for their current tools. The focus is on efficiency and saving time – multi-photo operations, presets, and a robust export system do exactly that. We maintain the local-first ethos (all processing is on device, parallelize if possible to speed it up). Phase 2 essentially gets Stillbytes to parity with Lightroom Classic on the most critical features (except some advanced edits), setting the stage for the final phase of niche advanced tools.
Phase 3: Advanced Editing Tools and History/Snapshot Features
Scope: Elevate Stillbytes with the advanced editing controls and completeness expected by power users, and finalize the UI around history and versioning. This phase brings in the fine-grained tools and quality-of-life improvements.
Expanded Adjustment Panels: Introduce the more advanced editing modules:
HSL / Color Adjustment panel: Implement the Hue/Saturation/Luminance sliders for individual color ranges. Ensure UI can switch between adjusting by hue vs saturation vs luminance, or show all sliders at once. Add the targeted adjustment tool for HSL if possible (so dragging on the photo adjusts the right color slider).
Color Grading / Split Toning panel: Provide the 3 (or 4) color wheels interface
nngroup.com
. Users can now do sophisticated color grading for shadows/mids/highlights. Include blending/luminance sliders as needed. This caters to portrait and creative editors who expect this feature (Lightroom’s Color Grading panel, Capture One’s Color Balance).
Tone Curve panel: If not done in Phase 1, fully implement now. Include a switch between Parametric (with region sliders) and Point Curve modes. Support RGB and individual channels. Also add an Histogram overlay behind the curve for reference, which is a nice touch many apps have.
Detail panel: Controls for Sharpening (Amount, Radius, Detail, Masking like Lightroom or simpler), Noise Reduction (Luma and Chroma). These require the engine to support those operations, which presumably it does. Having them in UI now allows final image polishing within Stillbytes, so users don’t need to round-trip to Photoshop for basic sharpening or noise reduction.
Lens Corrections panel: A place for auto lens correction toggle, distortion/vignette corrections if the engine can do it. Might integrate with an internal profile database or just manual sliders (Distortion, Vignette amount). At least a checkbox “Apply lens profile” if available – many pros expect the software to auto-fix lens issues by default (Lightroom does if it has a profile). If we have no database, perhaps skip or allow manual only in Phase 3.
Local Adjustments (Selective Editing): This is a big one – masks, brushes, gradients. It wasn’t explicitly requested in the brief, but many advanced edits require it (dodge & burn, sky gradients, etc.). If the canvas edit engine supports local masks, Phase 3 should introduce a Gradiented filter tool (like Lightroom’s Linear Gradient and Radial Filter) and a Brush tool for selective edits. These would get their own UI: perhaps a toolbar with “Add Gradient”, “Add Brush Mask” and a way to manage multiple masks (like how Capture One has layers, or Lightroom shows pins). Implementing a full layer/mask system might be very involved, so it could be a Phase 4 in reality. But even a basic linear gradient for exposure adjustments would be highly beneficial in Phase 3 if doable.
Snapshots & Virtual Copies: Finalize the History panel to include Snapshots (user can click “Take Snapshot” at any point, name it). Display snapshots in a list (like Lightroom’s snapshot panel or Darktable’s left panel)
darktable.org
. Also possibly allow Virtual Copies (another entry of the same image that can have a different edit). Virtual copies could be shown in grid as duplicates (maybe with a small corner badge). This is more a DAM feature, but if easy via duplicating the record in IndexedDB with a new ID, it’s powerful for versioning edits. At least snapshots might suffice if actual separate versions are complicated.
History Panel UI: Fully realize the History list in the UI now. Show each step by name as we log them. Let the user click an entry to preview that state
support.captureone.com
. Add a right-click menu on history entries for things like “Rename step” or “Copy history from here” if needed. Include buttons: “Revert to Original” (which essentially selects the bottom-most “Original” item), “Clear History” (maybe to wipe all edits and start over), and “Compress History” (optional advanced function to flatten the stack to current state
docs.darktable.org
). The compress function can help performance if very long histories exist, but it’s optional.
Also ensure that when switching images, the history panel updates to show that image’s history.
If multiple images are selected and in Develop (not typical in Lightroom, but if we allowed multi-edit view), perhaps disable history or show “Multiple selected” message.
The History panel combined with snapshots will give power users the confidence to experiment wildly and still recover an earlier state easily.
Enhanced XMP & Interop: Now implement writing of develop settings to XMP in a more complete way. Perhaps adhere to Adobe’s XMP schema for any common adjustments for compatibility. At least, embed Stillbytes’ own edit stack in XMP (maybe as a block of text or custom XML) so that if the DB is lost, a user could re-import images and choose “Read sidecar” to restore edits
docs.darktable.org
. Provide a command “Read/Import Sidecar” on an image to ingest XMP edits (Darktable has this
docs.darktable.org
). This could allow migrating from other software if we parse some of their XMP (e.g., read Lightroom’s Exposure setting from XMP and apply to our engine if possible). Full compatibility isn’t expected, but partial (white balance, exposure, ratings) can be.
Also, finalize metadata panels. Possibly add a Metadata panel for IPTC data (Title, Caption, Keywords, Photographer, Copyright) so Stillbytes can be used as a mini-DAM. Write those to XMP as well. Many pros need to embed copyright info on export – if we have a place to store it and ensure it goes to exported files, that’s good. This wasn’t explicitly asked, but it’s part of pro workflow when delivering images.
Polish Export & Presets: Incorporate any missing advanced options into Export:
e.g., Watermarking (maybe allow adding a PNG logo or text watermark in export settings).
Option to export Original + XMP (for handing raw + edits to someone).
Fine-tune multi-recipe export if not done: allow multi-select presets and exporting multiple formats in one go. A UI idea is checkboxes next to each Export preset; checking multiple will generate all.
Possibly integration with publishing plugins (maybe out of scope since no cloud – but maybe exporting directly to a shared folder or external application trigger).
Performance and UX Refinements: With all features in, focus on optimizing:
Ensure the interface remains snappy (large filmstrip with hundreds of images should scroll smoothly; canvas rendering for complex edits still responsive).
Keyboard shortcuts: consider adding more or letting users customize now. If users requested the ability to change key mapping, Phase 3 can introduce a keyboard shortcuts editor or at least a config file approach.
UI tweaks: e.g., allow user to drag-resize panels, customize which panels show (Darktable lets you hide certain modules; Lightroom lets you solo-mode collapse). Perhaps implement a Solo Mode toggle for the adjustment accordion (only one panel expands at a time) – some prefer that to reduce scrolling.
Multi-monitor support: If Electron allows window detaching, maybe let the filmstrip or a second image view be moved to another monitor (this is advanced, could be future).
Finish any remaining localization/internationalization if needed (for wider adoption, though likely English to start given target user base).
Testing with Real Workflows: Phase 3 should involve rigorous testing with sample real-world scenarios: e.g., import 1000 RAWs, do heavy adjustments, lots of local edits, compare performance to Lightroom on same hardware. Optimize caching (maybe cache full-sized JPEG of final image for quick before/after load, etc.). Ensure memory usage of big batches is handled (release image data when not needed).
Documentation & Help UI: Provide in-app help or documentation for these advanced features. Possibly tooltips for each slider explaining what it does (briefly). A “?” help icon that opens a shortcut cheat sheet and quick tips. This reduces learning curve for new users coming from other software.
Rationale: Phase 3 makes Stillbytes a comprehensive professional tool. By adding the nuanced controls (HSL, curves, masking, etc.), photographers can achieve the same level of creative editing as in Lightroom or Capture One within Stillbytes. The History panel and snapshots increase confidence to experiment, and features like presets, metadata, and XMP ensure that Stillbytes can integrate fully into pro workflows or even replace existing tools without loss of functionality. Essentially, Phase 3 is about closing the gap on any missing “power features” that a seasoned user would look for when considering migrating to Stillbytes. At completion of Phase 3, we have a robust, desktop-first RAW editor that is local-first (privacy assured), fast on batch operations, and familiar in feel to Lightroom Classic users – fulfilling the project goal of an offline Lightroom/CaptureOne alternative. Sources:
Fstoppers – Lightroom rating and flag shortcuts
fstoppers.com
fstoppers.com
Reddit – Tips for fast culling in Lightroom (auto-advance with Caps Lock)
reddit.com
Hand and Arrow Photography – Culling workflow with Photo Mechanic (fast navigation and tagging keepers)
handandarrow.com
handandarrow.com
Darktable User Manual – Filmstrip for quick image switching
docs.darktable.org
 and copy/paste history shortcuts
docs.darktable.org
Darktable User Manual – Writing sidecar XMP files automatically for each edit
docs.darktable.org
Lightroom Queen Forums – Before/After view shortcuts in Lightroom (Backslash and Y keys)
lightroomqueen.com
Capture One Support – Lack of history panel (Lightroom offers it, C1 doesn’t)
support.captureone.com
support.captureone.com
“Schedule” App Review (ItsFOSS) – Emphasizing privacy-first, local-first design (no accounts, works offline)
itsfoss.com
Adobe Help – Lightroom Copy/Paste Settings dialog with selectable adjustment categories
helpx.adobe.com
helpx.adobe.com
Darktable Screenshots – UI showing history, snapshots, and before/after slider in a professional RAW editor
darktable.org
darktable.org
Citations
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>
screenshots | darktable

<https://www.darktable.org/about/screenshots/>
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>

How to Cull in Photo Mechanic in 10 Easy Steps - Hand and Arrow Photography

<https://handandarrow.com/how-to-cull-in-photo-mechanic-in-10-easy-steps/>

Stop Wasting Your Time and Start Using Lightroom Rating Systems | Fstoppers

<https://fstoppers.com/originals/stop-wasting-your-time-and-start-using-lightroom-rating-systems-377741>

Stop Wasting Your Time and Start Using Lightroom Rating Systems | Fstoppers

<https://fstoppers.com/originals/stop-wasting-your-time-and-start-using-lightroom-rating-systems-377741>
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>

Stop Wasting Your Time and Start Using Lightroom Rating Systems | Fstoppers

<https://fstoppers.com/originals/stop-wasting-your-time-and-start-using-lightroom-rating-systems-377741>

In what ways, if any is Photo Mechanic better at culling/ranking photos than Capture One? : r/photography

<https://www.reddit.com/r/photography/comments/1eu46y6/in_what_ways_if_any_is_photo_mechanic_better_at/>

How to Cull in Photo Mechanic in 10 Easy Steps - Hand and Arrow Photography

<https://handandarrow.com/how-to-cull-in-photo-mechanic-in-10-easy-steps/>

Workflow Tip // Cull Faster with Photo Mechanic

<https://www.trunghoangphotography.com/for-photographers/photo-mechanic-lightroom-workflow-culling-faster-with-photo-mechanic>

In what ways, if any is Photo Mechanic better at culling/ranking photos than Capture One? : r/photography

<https://www.reddit.com/r/photography/comments/1eu46y6/in_what_ways_if_any_is_photo_mechanic_better_at/>

How to Cull in Photo Mechanic in 10 Easy Steps - Hand and Arrow Photography

<https://handandarrow.com/how-to-cull-in-photo-mechanic-in-10-easy-steps/>

How to Cull in Photo Mechanic in 10 Easy Steps - Hand and Arrow Photography

<https://handandarrow.com/how-to-cull-in-photo-mechanic-in-10-easy-steps/>

Sliders, Knobs, and Matrices: Balancing Exploration and Precision - NN/G

<https://www.nngroup.com/articles/sliders-knobs/>

Sliders, Knobs, and Matrices: Balancing Exploration and Precision - NN/G

<https://www.nngroup.com/articles/sliders-knobs/>

Sliders, Knobs, and Matrices: Balancing Exploration and Precision - NN/G

<https://www.nngroup.com/articles/sliders-knobs/>

Sliders, Knobs, and Matrices: Balancing Exploration and Precision - NN/G

<https://www.nngroup.com/articles/sliders-knobs/>
screenshots | darktable

<https://www.darktable.org/about/screenshots/>
screenshots | darktable

<https://www.darktable.org/about/screenshots/>

Re: Sliders in Lightroom - Adobe Product Community - 15019471

<https://community.adobe.com/t5/lightroom-classic-discussions/sliders-in-lightroom/m-p/15023165>
Quick shortcut to compare original photo with present/most recent developed photo | Lightroom Queen Forums

<https://www.lightroomqueen.com/community/threads/quick-shortcut-to-compare-original-photo-with-present-most-recent-developed-photo.26849/>
screenshots | darktable

<https://www.darktable.org/about/screenshots/>
screenshots | darktable

<https://www.darktable.org/about/screenshots/>

Question about edit history in Capture One 20 – Home

<https://support.captureone.com/hc/en-us/community/posts/4407596158097-Question-about-edit-history-in-Capture-One-20?page=1#community_comment_4407609558289>

Question about edit history in Capture One 20 – Home

<https://support.captureone.com/hc/en-us/community/posts/4407596158097-Question-about-edit-history-in-Capture-One-20?page=1#community_comment_4407609558289>

Question about edit history in Capture One 20 – Home

<https://support.captureone.com/hc/en-us/community/posts/4407596158097-Question-about-edit-history-in-Capture-One-20?page=1#community_comment_4407609558289>
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>

Copy and paste edit settings

<https://helpx.adobe.com/lightroom-classic/help/copy-paste-settings.html>

Copy and paste edit settings

<https://helpx.adobe.com/lightroom-classic/help/copy-paste-settings.html>

Copy and paste edit settings

<https://helpx.adobe.com/lightroom-classic/help/copy-paste-settings.html>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>

Process Recipes and Export Recipes - Capture One | Support

<https://support.captureone.com/hc/en-us/articles/360002633697-Process-Recipes-and-Export-Recipes>

Away from Cloud: This Local, Offline Tool is Perfect for Personal Project Management on Linux Desktop

<https://itsfoss.com/schedule-kanban-board/>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>

How to flag, label, and rate photos in Lightroom Classic

<https://helpx.adobe.com/lightroom-classic/help/flag-label-rate-photos.html>
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>
Photo Mechanic 2025.5 Release Candidate: Keyboard Shortcuts ...

<https://forums.camerabits.com/index.php?topic=16812.0>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>
darktable 3.8 user manual - filmstrip

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/shared/filmstrip/>
darktable 3.8 user manual - history stack

<https://docs.darktable.org/usermanual/3.8/en/module-reference/utility-modules/lighttable/history-stack/>

How to Cull in Photo Mechanic in 10 Easy Steps - Hand and Arrow Photography

<https://handandarrow.com/how-to-cull-in-photo-mechanic-in-10-easy-steps/>
