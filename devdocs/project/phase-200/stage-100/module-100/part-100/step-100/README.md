### Day 8-10: Canvas Editing (4 hours)
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