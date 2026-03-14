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
  const confirmClasses = variant === 'destructive'
    ? 'bg-red-500 text-white hover:bg-red-600'
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm bg-white dark:bg-[#252540] rounded-2xl shadow-soft-lg z-[61] p-6"
          >
            <h3 className="font-display font-bold text-ink text-lg mb-2">{title}</h3>
            <p className="text-sm font-body text-concrete leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-2.5 font-display font-bold rounded-xl text-sm transition-colors ${confirmClasses}`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-concrete font-display font-bold rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
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
