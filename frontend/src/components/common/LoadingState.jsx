import { motion } from 'framer-motion';
import { Sparkles, Search, ShoppingCart, Check } from 'lucide-react';

const steps = [
  { icon: Sparkles, label: 'Analyzing your input...' },
  { icon: Search, label: 'Finding products...' },
  { icon: ShoppingCart, label: 'Building your cart...' },
];

export default function LoadingState({ currentStep = 0 }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            border: '2px solid var(--color-bg-tertiary)',
            borderTopColor: 'var(--color-accent)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {(() => {
            const Icon = steps[currentStep]?.icon || Sparkles;
            return (
              <motion.div
                key={currentStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} style={{ color: 'var(--color-accent)' }} />
              </motion.div>
            );
          })()}
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 transition-opacity duration-300"
            style={{ opacity: i <= currentStep ? 1 : 0.3 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
              style={{
                background: i <= currentStep ? 'var(--color-accent)' : 'var(--color-bg-hover)',
              }}
            />
            <span
              className="text-[13px] transition-colors duration-300"
              style={{ color: i === currentStep ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
            >
              {step.label}
            </span>
            {i < currentStep && (
              <Check size={13} style={{ color: 'var(--color-success)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Skeleton */}
      <div className="w-full max-w-sm space-y-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton w-full" style={{ height: '52px', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
