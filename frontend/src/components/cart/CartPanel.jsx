import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, AlertCircle, TrendingDown } from 'lucide-react';
import CartItem from './CartItem';
import LoadingState from '../common/LoadingState';

export default function CartPanel({ cart, unavailableItems, totalPrice, budgetExceeded, budget, isLoading, loadingStep, isEmpty }) {
  if (isLoading) {
    return (
      <div
        className="h-full flex flex-col p-6 overflow-y-auto"
        style={{ borderRight: '1px solid var(--color-border)' }}
      >
        <LoadingState currentStep={loadingStep} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-6 text-center"
        style={{ borderRight: '1px solid var(--color-border)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <ShoppingCart size={24} style={{ color: 'var(--color-text-tertiary)' }} />
        </div>
        <h3 className="text-[15px] font-semibold text-text-primary mb-1">Your cart is empty</h3>
        <p className="text-[13px] text-text-secondary max-w-[280px] leading-relaxed">
          Paste a recipe or shopping list on the left to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ borderRight: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <h2 className="text-[15px] font-semibold text-text-primary">Cart</h2>
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
          >
            {cart?.length || 0}
          </span>
        </div>
        <span className="text-[15px] font-semibold" style={{ color: 'var(--color-accent)' }}>
          ₹{totalPrice}
        </span>
      </div>

      {/* Budget bar */}
      {budget && (
        <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
              <TrendingDown size={11} /> Budget
            </span>
            <span
              className="font-medium"
              style={{ color: budgetExceeded ? 'var(--color-danger)' : 'var(--color-success)' }}
            >
              ₹{totalPrice} / ₹{budget}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalPrice / budget) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: budgetExceeded ? 'var(--color-danger)' : 'var(--color-success)',
              }}
            />
          </div>
        </div>
      )}

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <AnimatePresence mode="popLayout">
          {cart?.map((item, i) => (
            <CartItem key={`${item.sku}-${i}`} item={item} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Unavailable items */}
      {unavailableItems && unavailableItems.length > 0 && (
        <div className="px-5 py-3 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle size={12} style={{ color: 'var(--color-warning)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-warning)' }}>
              {unavailableItems.length} unavailable
            </span>
          </div>
          <div className="space-y-1">
            {unavailableItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[12px] px-3 py-2 rounded-lg"
                style={{ background: 'var(--color-bg-tertiary)' }}
              >
                <span className="text-text-secondary capitalize">{item.name}</span>
                <span className="text-text-tertiary">
                  {item.reason === 'not_in_catalog' ? 'Not in catalog' : 'Out of stock'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div
        className="px-5 py-3 flex items-center justify-between shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <span className="text-[13px] text-text-secondary">Total ({cart?.length} items)</span>
        <span className="text-[17px] font-semibold text-text-primary">₹{totalPrice}</span>
      </div>
    </div>
  );
}
