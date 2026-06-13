import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ErrorBanner({ error, onDismiss }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 bg-red-50 border border-red-200 shadow-sm"
        >
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-800 font-medium flex-1">{error}</p>
          {onDismiss && (
            <button onClick={onDismiss} className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-md transition-colors">
              <X size={16} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
