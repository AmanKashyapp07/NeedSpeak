import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, AlertCircle, TrendingDown } from 'lucide-react';
import CartItem from './CartItem';
import LoadingState from '../common/LoadingState';

export default function CartPanel({ cart, unavailableItems, totalPrice, budgetExceeded, budget, isLoading, loadingStep, isEmpty }) {
  if (isLoading) {
    return (
      <div className="glass-panel h-full flex flex-col p-6 overflow-y-auto">
        <LoadingState currentStep={loadingStep} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="glass-panel h-full flex flex-col items-center justify-center p-8 text-center bg-white min-h-[400px]">
        <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
          <ShoppingCart size={32} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Your Cart is Empty</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Paste a recipe, shopping list, or URL above to automatically build your cart.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel h-full flex flex-col p-6 overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Cart</h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
            {cart?.length || 0} items
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">Rs. {totalPrice}</p>
      </div>

      {/* Budget bar */}
      {budget && (
        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <TrendingDown size={16} className="text-slate-400" /> Budget
            </span>
            <span className={`font-semibold ${budgetExceeded ? 'text-danger' : 'text-success'}`}>
              Rs. {totalPrice} / Rs. {budget}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalPrice / budget) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                backgroundColor: budgetExceeded ? 'var(--color-danger)' : 'var(--color-success)',
              }}
            />
          </div>
        </div>
      )}

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {cart?.map((item, i) => (
            <CartItem key={`${item.sku}-${i}`} item={item} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Unavailable items */}
      {unavailableItems && unavailableItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-5 border-t border-slate-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-warning" />
            <span className="text-sm font-semibold text-slate-800">
              {unavailableItems.length} item{unavailableItems.length > 1 ? 's' : ''} unavailable
            </span>
          </div>
          <div className="space-y-2">
            {unavailableItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm px-4 py-2.5 rounded-lg bg-orange-50 border border-orange-100/50">
                <span className="text-slate-700 capitalize font-medium">{item.name}</span>
                <span className="text-orange-600/80 text-xs font-semibold uppercase tracking-wider">
                  {item.reason === 'not_in_catalog' ? 'Not in catalog' : 'Out of stock'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Total bar */}
      <div className="mt-6 pt-5 flex items-center justify-between border-t border-slate-200">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total ({cart?.length} items)</span>
        <span className="text-3xl font-bold text-slate-900 tracking-tight">Rs. {totalPrice}</span>
      </div>
    </div>
  );
}
