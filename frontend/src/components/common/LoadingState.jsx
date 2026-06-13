import { motion } from 'framer-motion';
import { Sparkles, Search, ShoppingCart } from 'lucide-react';

const steps = [
  { icon: Sparkles, label: 'Analyzing your input...', color: '#F59E0B' },
  { icon: Search, label: 'Finding products...', color: '#3B82F6' },
  { icon: ShoppingCart, label: 'Building your cart...', color: '#10B981' },
];

export default function LoadingState({ currentStep = 0 }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8 bg-white rounded-2xl">
      {/* Animated orb */}
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full" style={{
          background: `conic-gradient(from 0deg, ${steps[currentStep]?.color || '#F59E0B'}, transparent, ${steps[currentStep]?.color || '#F59E0B'})`,
          opacity: 0.15,
          filter: 'blur(12px)',
        }} />
        <div className="absolute inset-3 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
          {(() => {
            const Icon = steps[currentStep]?.icon || Sparkles;
            return (
              <motion.div
                key={currentStep}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Icon size={24} style={{ color: steps[currentStep]?.color }} />
              </motion.div>
            );
          })()}
        </div>
      </motion.div>

      {/* Steps */}
      <div className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: i <= currentStep ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{
              background: i <= currentStep ? step.color : '#E2E8F0',
              boxShadow: i === currentStep ? `0 0 8px ${step.color}60` : 'none',
            }} />
            <span className={`text-sm font-medium ${i === currentStep ? 'text-slate-900' : 'text-slate-500'}`}>
              {step.label}
            </span>
            {i < currentStep && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2"
              >
                Done
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Skeleton cart items */}
      <div className="w-full max-w-md space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 w-full rounded-xl" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}
