import { motion } from 'framer-motion';
import { Package, ArrowRightLeft, Info } from 'lucide-react';

export default function CartItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`flex items-center gap-3 py-3 transition-colors duration-100 ${
        item.optional ? 'opacity-60' : ''
      }`}
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{
          background: item.substituted
            ? 'rgba(196, 168, 74, 0.08)'
            : 'var(--color-accent-soft)',
        }}
      >
        {item.substituted ? (
          <ArrowRightLeft size={15} style={{ color: 'var(--color-warning)' }} />
        ) : (
          <Package size={15} style={{ color: 'var(--color-accent)' }} />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-[13px] font-medium text-text-primary truncate capitalize">
            {item.name}
          </h4>
          {item.optional && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}
            >
              Optional
            </span>
          )}
          {item.substituted && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(196, 168, 74, 0.1)', color: 'var(--color-warning)' }}
            >
              Swapped
            </span>
          )}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
          {item.brand} · {item.quantity_units} × {item.unit_quantity}{item.unit}
        </p>
        {item.substitution_reason && (
          <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
            <Info size={9} /> {item.substitution_reason}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <p className="text-[13px] font-medium text-text-primary">₹{item.total_price_inr}</p>
        {item.quantity_units > 1 && (
          <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>₹{item.price_per_unit_inr} each</p>
        )}
      </div>
    </motion.div>
  );
}
