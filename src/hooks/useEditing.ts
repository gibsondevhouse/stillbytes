import { useState, useCallback } from 'react';
import { EditOperation } from '@/types';

interface UseEditingReturn {
    operations: EditOperation[];
    canUndo: boolean;
    canRedo: boolean;
    hasUnsavedChanges: boolean;
    addOperation: (op: EditOperation) => void;
    undo: () => void;
    redo: () => void;
    reset: () => void;
    setOperations: (ops: EditOperation[]) => void;
}

export const useEditing = (initialOperations: EditOperation[] = []): UseEditingReturn => {
    // History is a list of lists of operations. 
    // history[currentStep] = the list of operations at this point in time.
    // Actually, a standard undo/redo for a stack of operations usually means:
    // The "state" is the list of operations.
    // Undo means "remove the last operation". Redo means "put it back".
    // But sometimes we replace an operation (e.g. dragging a slider).

    // For simplicity in this editor, let's treat the "operations" array as the source of truth.
    // But to support proper undo/redo including "replaced" ops (like slider dragging), 
    // we often need a separate history stack if we want granular undo.
    // However, the `EditHistory` component itself allows jumping to any point.
    // So the "Edit Stack" IS the history.
    // But wait, if I have [Exp, HSL, Contrast] and I click "Exp", I want to revert to just [Exp].
    // That's what `EditHistory` does.
    // "Undo" typically just means "go back one step".

    // Let's implement a robust history where every change to the operation list creates a history entry.
    // This allows undoing "Reset" or "Restore" actions too.

    const [history, setHistory] = useState<EditOperation[][]>([initialOperations]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const operations = history[currentIndex];

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;
    const hasUnsavedChanges = operations.length > 0; // Simplified logic

    const addEntry = useCallback((newOps: EditOperation[]) => {
        setHistory(prev => {
            const newHistory = prev.slice(0, currentIndex + 1);
            newHistory.push(newOps);
            return newHistory;
        });
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex]);

    // To be used when a slider changes (replacing the last operation of same type? No, usually we just update state)
    // For this specific 'stacks' model, checking if we should "replace" the last history entry or "add" one
    // is often done by checking if the last op was looking at the same thing.
    // But for now, let's just expose a way to "set operations" which pushes to history.
    // NOTE: A slider dragging might flood history. We rely on the caller to debounce/commit.

    const setOperations = useCallback((newOps: EditOperation[]) => {
        addEntry(newOps);
    }, [addEntry]);

    const addOperation = useCallback((op: EditOperation) => {
        // If operation of this type exists, usually we replace it or append?
        // In this app, we seem to replace existing ops of same type (like Exposure).
        // Let's replicate `AdjustmentPanel` logic here or just generic append?
        // Actually `AdjustmentPanel` logic was: find existing, replace it, or push new.
        // Let's keep that logic in the UI or move it here?
        // Moving it here creates a cleaner API: `updateOperation(type, params)`.
        // But the hook signature asked for `addOperation`.
        // Let's stick to `setOperations` for bulk updates from `AdjustmentPanel` for now to be safe,
        // or just strictly append.

        // Wait, `AdjustmentPanel` handles the logic of "replace vs append".
        // It calls `onChange(newOps)`.
        // So `useEditing` just needs to accept `newOps`.

        // We will expose `setOperations` as the primary way to update.
        // `addOperation` might be redundant if `AdjustmentPanel` does the logic.
        // Let's alias it for clarity or just use setOperations.
        // Let's keep `addOperation` for single additions if needed, but `setOperations` is what `AdjustmentPanel` needs.

        // Actually, let's make `addOperation` strictly append, and let UI handle logic?
        // No, let's just use `setOperations` as the primary integration point for `AdjustmentPanel`.
        addEntry([...operations, op]);
    }, [addEntry, operations]);

    const undo = useCallback(() => {
        if (canUndo) setCurrentIndex(prev => prev - 1);
    }, [canUndo]);

    const redo = useCallback(() => {
        if (canRedo) setCurrentIndex(prev => prev + 1);
    }, [canRedo]);

    const reset = useCallback(() => {
        addEntry([]);
    }, [addEntry]);

    return {
        operations,
        canUndo,
        canRedo,
        hasUnsavedChanges,
        addOperation,
        undo,
        redo,
        reset,
        setOperations
    };
};
