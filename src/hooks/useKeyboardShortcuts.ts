import { useEffect, useCallback } from 'react';

export type ShortcutHandler = () => void;

export function useKeyboardShortcuts(shortcuts: Record<string, ShortcutHandler>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = [
        e.ctrlKey && 'Ctrl',
        e.metaKey && 'Meta',
        e.altKey && 'Alt',
        e.shiftKey && 'Shift',
        e.key,
      ]
        .filter(Boolean)
        .join('+');
      const handler = shortcuts[key];
      if (handler) {
        e.preventDefault();
        handler();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
