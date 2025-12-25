import { useEffect, useRef } from 'react';
import { Photo } from '@/types';
import { updatePhoto } from '@/services/db';
import toast from 'react-hot-toast';

interface ShortcutHandlers {
    onRate?: (rating: 0 | 1 | 2 | 3 | 4 | 5) => void;
    onFlag?: (flag: 'pick' | 'reject' | null) => void;
    onNext?: () => void;
    onPrev?: () => void;
    onClose?: () => void; // For Grid (G) view or Escape
    onCompare?: (active: boolean) => void; // For Backslash
    onEnter?: () => void;
    onDevelop?: () => void; // For D
}

interface UseShortcutsOptions {
    enabled?: boolean;
    autoAdvance?: boolean | 'capsLock';
}

export function useShortcuts(handlers: ShortcutHandlers, options: UseShortcutsOptions = {}) {
    // Use refs to avoid effect re-runs on handler changes
    const handlersRef = useRef(handlers);
    const optionsRef = useRef(options);

    useEffect(() => {
        handlersRef.current = handlers;
        optionsRef.current = options;
    }, [handlers, options]);

    useEffect(() => {
        if (options.enabled === false) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if input is focused
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const { onRate, onFlag, onNext, onPrev, onClose, onCompare, onEnter } = handlersRef.current;
            const { autoAdvance } = optionsRef.current;

            const shouldAutoAdvance = () => {
                if (autoAdvance === 'capsLock') return e.getModifierState('CapsLock');
                return !!autoAdvance;
            }

            // Rating (1-5, 0)
            if (e.key >= '0' && e.key <= '5') {
                if (onRate) {
                    onRate(parseInt(e.key) as any);
                    if (shouldAutoAdvance() && onNext) onNext();
                }
            }

            // Flags (P, X, U)
            // P = Pick
            if (e.code === 'KeyP') {
                if (onFlag) {
                    onFlag('pick');
                    if (shouldAutoAdvance() && onNext) onNext();
                }
            }
            if (e.code === 'KeyX') {
                if (onFlag) {
                    onFlag('reject');
                    if (shouldAutoAdvance() && onNext) onNext();
                }
            }
            if (e.code === 'KeyU') {
                if (onFlag) {
                    onFlag(null);
                    // Usually don't auto-advance on Unflag
                }
            }

            // Navigation
            if (e.key === 'ArrowRight') if (onNext) onNext();
            if (e.key === 'ArrowLeft') if (onPrev) onPrev();
            if (e.key === 'Escape' || e.key.toLowerCase() === 'g') if (onClose) onClose();
            if (e.key.toLowerCase() === 'd') if (onDevelop) onDevelop();

            // Enter
            if (e.key === 'Enter') if (onEnter) onEnter();

            // Compare
            if (e.key === '\\') if (onCompare) onCompare(true);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const { onCompare } = handlersRef.current;
            if (e.key === '\\') if (onCompare) onCompare(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [options.enabled]);
}
