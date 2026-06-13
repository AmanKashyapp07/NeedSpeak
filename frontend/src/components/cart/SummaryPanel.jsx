import { motion } from 'framer-motion';
import { Brain, Tag, Package, AlertTriangle, IndianRupee, ChefHat, Wrench, BookOpen, Pill, ShoppingBag } from 'lucide-react';

const intentIcons = {
  recipe: ChefHat,
  diy: Wrench,
  supplies: BookOpen,
  medical: Pill,
  general: ShoppingBag,
};

const intentColors = {
  recipe: 'text-amber-600 bg-amber-50 border-amber-200',
  diy: 'text-blue-600 bg-blue-50 border-blue-200',
  supplies: 'text-purple-600 bg-purple-50 border-purple-200',
  medical: 'text-red-600 bg-red-50 border-red-200',
  general: 'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const intentBgColors = {
  recipe: 'bg-amber-100',
  diy: 'bg-blue-100',
  supplies: 'bg-purple-100',
  medical: 'bg-red-100',
  general: 'bg-emerald-100',
};

export default function SummaryPanel({ intentType, contextSummary, summary, cart, unavailableItems, totalPrice, isEmpty }) {
  if (isEmpty) {
    return (
      <div className="glass-panel h-full flex flex-col items-center justify-center p-8 text-center bg-white min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 shadow-sm">
          <Brain size={28} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">AI Summary</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          After processing your input, a detailed summary will appear here.
        </p>
      </div>
    );
  }

  const IntentIcon = intentIcons[intentType] || ShoppingBag;
  const colorClasses = intentColors[intentType] || intentColors.general;
  const iconBgClass = intentBgColors[intentType] || intentBgColors.general;
  
  const itemsFound = cart?.length || 0;
  const itemsUnavailable = unavailableItems?.length || 0;
  const substituted = cart?.filter(i => i.substituted)?.length || 0;

  return (
    <div className="glass-panel h-full flex flex-col p-6 overflow-y-auto gap-6 bg-white">
      {/* Intent badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-4 p-5 rounded-2xl border shadow-sm ${colorClasses}`}
      >
        <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${iconBgClass}`}>
          <IntentIcon size={24} className="opacity-80" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1 block">
            {intentType}
          </span>
          <p className="text-sm font-medium text-slate-900 leading-relaxed">{contextSummary}</p>
        </div>
      </motion.div>

      {/* AI Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-50 p-5 rounded-2xl border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-accent" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Summary</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">{summary}</p>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <StatCard icon={Package} label="Items Found" value={itemsFound} colorClass="text-emerald-600" />
        <StatCard icon={AlertTriangle} label="Unavailable" value={itemsUnavailable} colorClass={itemsUnavailable > 0 ? 'text-amber-600' : 'text-emerald-600'} />
        <StatCard icon={Tag} label="Substituted" value={substituted} colorClass={substituted > 0 ? 'text-blue-600' : 'text-emerald-600'} />
        <StatCard icon={IndianRupee} label="Total Cost" value={`Rs. ${totalPrice}`} colorClass="text-emerald-600" />
      </motion.div>

      {/* Powered by */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <p className="text-[11px] font-medium text-slate-400 text-center uppercase tracking-widest">
          Powered by Amazon Bedrock
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={colorClass} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}
