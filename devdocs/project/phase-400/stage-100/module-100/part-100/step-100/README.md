### Day 21-23: Testing + Refinement (3 hours)
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