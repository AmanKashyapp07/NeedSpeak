import { motion } from 'framer-motion';
import { Package, ArrowRightLeft, Info } from 'lucide-react';

export default function CartItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: 'easeOut' }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200 bg-white border hover:shadow-md hover:border-slate-300 ${
        item.optional ? 'opacity-60 grayscale-[0.2]' : 'border-slate-200 shadow-sm'
      }`}
    >
      {/* Product icon */}
      <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
        item.substituted ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'
      }`}>
        {item.substituted ? (
          <ArrowRightLeft size={20} className="text-warning" />
        ) : (
          <Package size={20} className="text-accent" />
        )}
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-base font-semibold text-slate-900 truncate capitalize">
            {item.name}
          </h4>
          {item.optional && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium border border-slate-200">
              Optional
            </span>
          )}
          {item.substituted && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200 uppercase tracking-wider">
              Swapped
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium">
          <span className="text-slate-700">{item.brand}</span> &middot; {item.quantity_units} &times; {item.unit_quantity}{item.unit}
        </p>
        {item.substitution_reason && (
          <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1 font-medium bg-orange-50 w-fit px-2 py-1 rounded-md">
            <Info size={12} /> {item.substitution_reason}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right shrink-0 flex flex-col justify-center">
        <p className="text-lg font-bold text-slate-900 tracking-tight">Rs. {item.total_price_inr}</p>
        {item.quantity_units > 1 && (
          <p className="text-xs text-slate-400 font-medium mt-0.5">Rs. {item.price_per_unit_inr} each</p>
        )}
      </div>
    </motion.div>
  );
}
