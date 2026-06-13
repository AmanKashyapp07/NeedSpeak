import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorBanner({ error, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(204, 117, 117, 0.08)',
            border: '1px solid rgba(204, 117, 117, 0.15)',
          }}
        >
          <AlertTriangle size={15} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <p className="text-[13px] flex-1" style={{ color: 'var(--color-danger)' }}>{error}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="shrink-0 p-0.5 rounded transition-colors duration-100"
              style={{ color: 'var(--color-danger)', opacity: 0.5 }}
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
