Perfect—got it. You're NOT writing code by hand. **AI writes 100% of the code, you paste prompts and review output.**

Let me revise the plan with this critical mindset shift:

# **STILLBYTES MVP BUILD PLAN (AI-FIRST EDITION)**

**Core Principle:** Every line of code is AI-generated. Your job is prompt engineering + code review.

---

## **THE NEW REALITY**

You don't write code. You:

1. **Paste a prompt** into Claude/Copilot/Gemini
2. **AI generates complete file** (100-500 lines)
3. **You review & iterate** ("Add error handling for X", "Make HSL values persistent")
4. **Repeat for all 30+ components**

**Implication:** Coding speed is NOW bottlenecked by:

- How clear your prompts are
- How many iterations to get it right
- Review time per component

This changes timeline estimates significantly.

---

## **REVISED TIME ESTIMATES (AI-CODED, 4-5 WEEKS)**

| Phase          | Component                                     | Time        | Why                                                                |
| -------------- | --------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| **Day 1**      | Setup (npm init, deps)                        | 1 hr        | Copilot scaffolds everything                                       |
| **Days 2-3**   | **Database Service**                          | 2 hrs       | Prompt → Copilot generates `db.ts` + all CRUD ops                  |
|                | **Types/Interfaces**                          | 1 hr        | Single prompt, complete `types/index.ts`                           |
| **Days 4-5**   | **Import Dialog + IPC**                       | 3 hrs       | Two files (preload.ts + ImportDialog.tsx), requires 1-2 iterations |
| **Days 6-7**   | **Gallery Grid**                              | 2 hrs       | Single prompt, responsive component                                |
| **Days 8-10**  | **Detail View + Canvas Filter Service**       | 4 hrs       | Two files, canvas math, test with real photos                      |
| **Days 11-12** | **HSL Slider + Brightness Sliders**           | 3 hrs       | Two slider components, real-time preview                           |
| **Days 13-14** | **Before/After + Edit History**               | 2 hrs       | Two UI components                                                  |
| **Days 15-17** | **Hooks (useEditing, useCanvasEditor, etc.)** | 3 hrs       | 3 custom hooks, logic-heavy                                        |
| **Days 18-20** | **Layout, Context, App Entry**                | 2 hrs       | Glue components together                                           |
| **Days 21-23** | **Testing + Integration**                     | 3 hrs       | Unit tests, fix bugs from manual testing                           |
| **Days 24-25** | **Polish, Dark Mode, Refinements**            | 2 hrs       | CSS tweaks, performance fixes                                      |
|                | **TOTAL V1**                                  | **~30 hrs** | **~25 days @ 20-30 hrs/week** ✅                                   |

---

## **THE ACTUAL WORKFLOW (Your Real Schedule)**

### **Day 1: Setup Phase (2 hours)**

```
10am: "Copilot, create a Vite + React + TypeScript project"
      → Generates package.json, vite.config.ts, tsconfig.json
11am: "Add Tailwind, install deps"
      → Copilot shows npm commands
Noon: npm install done, app runs
```

### **Day 2-3: Database Layer (3 hours)**

```
2pm (Day 2): Paste Prompt A: "Create IndexedDB service..."
            → Copilot generates src/services/db.ts (~200 lines)
            → You review, test in console
3:30pm: "Add better error messages for quota exceeded"
            → Copilot refines, you paste updated version
            → Done

Day 3: Paste Prompt B: "Create TypeScript types..."
       → Generates types/index.ts
       → Copilot also generates sample Photo/Library records
```

### **Day 4-5: Import Flow (3 hours)**

```
Day 4: Paste Prompt C: "Create Electron IPC preload..."
       → Generates electron/preload.ts (~150 lines)
       → Review, ask for improvements if needed

Day 5: Paste Prompt D: "Create ImportDialog component..."
       → Generates src/components/ImportDialog.tsx (~300 lines)
       → Integrates with db.ts, handles file copy + IPC
       → Test import with real camera folder
```

### **Day 6-7: Gallery View (2 hours)**

```
Day 6: Paste Prompt E: "Create responsive Gallery grid..."
       → Generates src/components/Gallery.tsx (~250 lines)
       → Shows thumbnails, handles empty state
       → Quick dark mode test

Day 7: "Make gallery 4 columns desktop, 2 mobile"
       → Copilot adjusts Tailwind grid classes
       → Deploy to canvas, see live preview
```

### **Day 8-10: Canvas Editing (4 hours)**

```
Day 8: Paste Prompt F: "Create Canvas filter service (HSL, brightness, contrast)..."
       → Generates src/services/imageEditor.ts (~250 lines)
       → Complex: HSL to RGB conversions, filter chaining
       → Test with real photo, measure performance

Day 9: Paste Prompt G: "Create DetailView component..."
       → Generates src/components/DetailView.tsx (~300 lines)
       → Two-pane layout, canvas rendering, slider integration
       → Load a real photo, test interaction

Day 10: "Fix lag when moving HSL slider"
        → Copilot adds debouncing, requestAnimationFrame
        → Test again, confirm smooth <100ms response
```

### **Day 11-14: Edit UI Components (4 hours)**

```
Day 11-12: Paste Prompts H, I, J:
           → HSLSlider.tsx (~150 lines)
           → BrightnessContrast.tsx (~120 lines)
           → Before/AfterToggle.tsx (~180 lines)
           → Quick integration check

Day 13: Paste Prompt K: "Create EditHistory component..."
        → Generates timeline/list of operations
        → Undo/redo buttons
        → Hook up to edit state

Day 14: "Make edit history persist to IndexedDB"
        → Copilot adds serialization logic
```

### **Day 15-17: State Management (2 hours)**

```
Day 15: Paste Prompt L: "Create useEditing hook..."
        → Generates src/hooks/useEditing.ts (~200 lines)
        → Manages operations, undo/redo, persistence

Day 16: Paste Prompt M: "Create useCanvasEditor hook..."
        → Generates src/hooks/useCanvasEditor.ts (~150 lines)
        → Canvas rendering, filter application

Day 17: Paste Prompt N: "Update PhotoContext to include editing state..."
        → Copilot extends existing context
        → Integration test: select photo → edit → save → reload
```

### **Day 18-20: Glue Components (2 hours)**

```
Day 18: Paste Prompt O: "Create Layout component..."
        → Sidebar + main area, responsive

Day 19: Paste Prompt P: "Create App.tsx entry..."
        → Wraps PhotoContext, Layout, ErrorBoundary

Day 20: Manual integration test:
        → Import folder → select photo → edit HSL → export
        → Fix any wiring issues
```

### **Day 21-23: Testing + Refinement (3 hours)**

```
Day 21: Paste Prompt Q: "Create unit tests for db.ts..."
        → Copilot generates tests/db.test.ts (~150 lines)
        → Run with Vitest, fix failing tests

Day 22: Paste Prompt R: "Create tests for canvas filters..."
        → Copilot generates tests/imageEditor.test.ts
        → Edge cases: HSL boundary values, etc.

Day 23: Manual testing sprint:
        → Import 50 photos, edit 5, export
        → Check for bugs, memory leaks, crashes
        → "Copilot, fix this console error..."
```

### **Day 24-25: Polish (2 hours)**

```
Day 24: "Refine dark mode, add vintage newspaper CSS"
        → Copilot generates updated styles/vintage.css
        → Test readability, eye strain

Day 25: Performance pass:
        → "Why is gallery slow with 100 photos?"
        → Copilot suggests lazy-loading, virtualization
        → Quick performance win
        → V1.0 ready to ship
```

---

## **PROMPT STRATEGY (You'll Use ~30 Prompts)**

### **Pattern: The 3-Part Prompt**

Every prompt you paste should include:

1. **CONTEXT** - What file, what it does, dependencies
2. **SPEC** - Exact requirements, props, return types
3. **CONSTRAINTS** - Performance, styling, edge cases

**Example:**

```
Create src/components/DetailView.tsx that:

CONTEXT:
- Main editing view (replaces Gallery when photo selected)
- Receives Photo object from PhotoContext
- Uses imageEditor service (src/services/imageEditor.ts)
- Uses useEditing hook (src/hooks/useEditing.ts)

SPEC:
- Two-pane layout: left (60%) canvas preview, right (40%) editing panel
- Canvas shows original photo + applied edits from editStack
- Real-time update as user moves sliders
- Buttons: Export, Revert to Original, Close
- Props: photo: Photo, onClose: () => void, onExport: (blob: Blob) => void

CONSTRAINTS:
- Dark mode only, Tailwind CSS
- Canvas renders full-res photo (performance: <100ms updates)
- Mobile: stack vertically
- Vintage aesthetic (serif fonts for labels)

Provide complete TypeScript component with JSDoc.
```

---

## **HOW TO HANDLE ITERATION (You WILL Need Revisions)**

### **Scenario 1: Output is 80% Right**

```
You: "Good start. Now:
  - Make the export button save to ~/Downloads/
  - Add a spinner while exporting
  - Show success toast after save
"

Copilot: [Refines component with those 3 additions]
```

### **Scenario 2: Performance Issue**

```
You: "When I edit 50 photos, HSL slider is laggy. Debug and optimize."

Copilot: [Adds debouncing, uses requestAnimationFrame, Web Workers suggestion]
```

### **Scenario 3: Bug in Generated Code**

```
You: "PhotoContext is undefined in DetailView. Fix the import path and add error handling."

Copilot: [Shows correct import, adds null check]
```

---

## **CRITICAL: AI BLINDSPOTS (Know These)**

Even amazing AI code has risks. **You must review for:**

| Issue                  | Why AI Misses It      | How to Catch                                        | How to Fix                                                    |
| ---------------------- | --------------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| **Off-by-one errors**  | Logic-dependent       | Test with edge case values (HSL = 180, 0, -180)     | "Handle boundary cases for HSL: test at min/max/zero"         |
| **Memory leaks**       | Subtle cleanup issues | Large import (1000 photos), close app, check memory | "Add cleanup in useEffect return for useEditing hook"         |
| **Type mismatches**    | Missing small details | TypeScript strict mode enabled?                     | "Enable strict mode in tsconfig, fix all errors"              |
| **Color math errors**  | Mathematical rigor    | Export photo, compare with original on screen       | "Test HSL color conversions with test values"                 |
| **IPC serialization**  | Complex JS semantics  | Try import after app restart                        | "IndexedDB serialization: test saving Blob objects"           |
| **Canvas performance** | Context-dependent     | Edit 100-photo session, measure FPS                 | "Profile canvas redraws, use offscreen canvas for thumbnails" |

---

## **REVIEW CHECKLIST (Before Each Prompt)**

Every time Copilot generates code, you should ask:

- [ ] Does it compile? (`npm run dev` - watch for errors)
- [ ] Does it match the spec I gave?
- [ ] Are there obvious bugs (missing return, wrong prop names)?
- [ ] Is TypeScript happy? (hover over variables, check types)
- [ ] Does it handle errors? (try bad input, empty state)
- [ ] Is performance acceptable? (test with real data)
- [ ] Does dark mode look okay?

---

## **REVISED WEEK-BY-WEEK BREAKDOWN**

### **Week 1: Foundation (Database + Import + Gallery)**

```
✅ Day 1: Project setup, npm install
✅ Days 2-3: Database service + types (easy AI wins)
✅ Days 4-5: Import dialog (requires 1-2 iterations)
✅ Days 6-7: Gallery grid (straightforward component)
```

**Checkpoint: Can import 50 photos, see grid, click to select** ✓

### **Week 2: Editing (Canvas + Sliders + History)**

```
✅ Days 8-10: Canvas service + DetailView (hardest part)
✅ Days 11-12: HSL/Brightness sliders (UI components)
✅ Days 13-14: Before/After + Edit History (integration)
```

**Checkpoint: Can edit HSL, see preview, undo/redo** ✓

### **Week 3: State + Glue (Hooks + Context + Layout)**

```
✅ Days 15-17: useEditing + useCanvasEditor + PhotoContext (logic)
✅ Days 18-20: Layout + App entry (glue components)
```

**Checkpoint: Full workflow works: import → edit → export** ✓

### **Week 4: Polish + Beta (Tests + Refinement)**

```
✅ Days 21-23: Unit tests, bug fixes, integration test
✅ Days 24-25: Dark mode polish, performance optimization
```

**Checkpoint: V1.0 ready for beta photographer** 🚀

---

## **SUCCESS CRITERIA (Redefined for AI-First)**

✅ **All prompts generated valid, compilable code**  
✅ **<3 iterations per component** (1st pass = 80% correct)  
✅ **Full app builds without errors**  
✅ **Real workflow works: import → edit → export**  
✅ **Responsive, dark mode, no major UX issues**  
✅ **Can ship to beta photographer**

---

## **WHAT CHANGES WITH AI-FIRST MINDSET**

| Traditional                   | AI-First                                  |
| ----------------------------- | ----------------------------------------- |
| You write code, debug         | AI writes code, you iterate               |
| Prompts are vague             | Prompts must be VERY specific             |
| You understand every line     | You understand architecture + key logic   |
| Bottleneck: your typing speed | Bottleneck: AI quality + your review time |
| Bug = you fix it              | Bug = refine prompt, AI fixes it          |
| QA is manual                  | QA is prompt review + edge case testing   |

---

## **IMMEDIATE NEXT STEPS (Tomorrow Morning)**

1. **Open Copilot in VS Code**
2. **Paste Prompt 1 (Setup):**

   ```
   Create a Vite + React + TypeScript boilerplate with:
   - Tailwind CSS configured
   - Dark mode enabled in tailwind.config.js
   - src/components/, src/services/, src/hooks/, src/types/ directories
   - src/main.tsx entry point
   - Basic App.tsx shell

   Generate package.json with all deps needed for Stillbytes v1.
   Include exifr, react-hot-toast, date-fns, react-hook-form.
   ```

3. **Copy output to repo** (or new local folder)
4. **Run `npm install && npm run dev`**
5. **If it compiles: ready for Prompt 2 (Database)**
