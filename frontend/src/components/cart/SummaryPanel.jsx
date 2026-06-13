import { motion } from 'framer-motion';
import { Brain, Tag, Package, AlertTriangle, IndianRupee, ChefHat, Wrench, BookOpen, Pill, ShoppingBag } from 'lucide-react';

const intentConfig = {
  recipe:   { icon: ChefHat,     label: 'Recipe',   color: '#C4956A' },
  diy:      { icon: Wrench,      label: 'DIY',      color: '#8BA4B8' },
  supplies: { icon: BookOpen,    label: 'Supplies', color: '#A68BC4' },
  medical:  { icon: Pill,        label: 'Medical',  color: '#C48B8B' },
  general:  { icon: ShoppingBag, label: 'General',  color: '#7DB87D' },
};

export default function SummaryPanel({ intentType, contextSummary, summary, cart, unavailableItems, totalPrice, isEmpty }) {
  if (isEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <Brain size={22} style={{ color: 'var(--color-text-tertiary)' }} />
        </div>
        <h3 className="text-[14px] font-semibold text-text-primary mb-1">Summary</h3>
        <p className="text-[12px] text-text-secondary max-w-[180px] leading-relaxed">
          AI-generated insights will appear here after processing.
        </p>
      </div>
    );
  }

  const config = intentConfig[intentType] || intentConfig.general;
  const IntentIcon = config.icon;
  const itemsFound = cart?.length || 0;
  const itemsUnavailable = unavailableItems?.length || 0;
  const substituted = cart?.filter(i => i.substituted)?.length || 0;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Intent */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${config.color}14` }}
          >
            <IntentIcon size={16} style={{ color: config.color }} />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>
              {config.label}
            </span>
            <p className="text-[13px] text-text-primary mt-0.5 leading-snug">{contextSummary}</p>
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              AI Summary
            </h3>
            <p className="text-[13px] text-text-primary leading-relaxed">{summary}</p>
          </motion.div>
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <StatRow icon={Package} label="Items found" value={itemsFound} />
          <StatRow icon={AlertTriangle} label="Unavailable" value={itemsUnavailable} warn={itemsUnavailable > 0} />
          <StatRow icon={Tag} label="Substituted" value={substituted} />
          <StatRow icon={IndianRupee} label="Total cost" value={`₹${totalPrice}`} accent />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-[10px] text-text-tertiary text-center">
          Powered by Amazon Bedrock · Claude Sonnet 4.6
        </p>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, warn, accent }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color: warn ? 'var(--color-warning)' : 'var(--color-text-tertiary)' }} />
        <span className="text-[12px] text-text-secondary">{label}</span>
      </div>
      <span
        className="text-[13px] font-medium"
        style={{ color: accent ? 'var(--color-accent)' : warn ? 'var(--color-warning)' : 'var(--color-text-primary)' }}
      >
        {value}
      </span>
    </div>
  );
}
