import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const stableOnCancel = useCallback(() => onCancel(), [onCancel]);

  // Focus trap and Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { stableOnCancel(); return; }
      if (e.key === 'Tab' && focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stableOnCancel]);

  const confirmClasses = variant === 'destructive'
    ? 'bg-[#c94a4a] text-white hover:bg-[#b54242]'
    : 'bg-ink text-white hover:bg-ink/90';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[60]"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm bg-white dark:bg-[#252540] rounded-2xl shadow-soft-lg z-[61] p-6"
          >
            <h3 id="confirm-title" className="font-display font-bold text-ink text-lg mb-2">{title}</h3>
            <p className="text-sm font-body text-concrete leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 font-display font-bold rounded-xl text-sm transition-colors ${confirmClasses}`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/10 text-concrete font-display font-bold rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
