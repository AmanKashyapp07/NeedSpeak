import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap } from 'lucide-react';
import InputPanel from './components/input/InputPanel';
import CartPanel from './components/cart/CartPanel';
import SummaryPanel from './components/cart/SummaryPanel';
import ErrorBanner from './components/common/ErrorBanner';
import { parseContent } from './services/api';

export default function App() {
  const [cart, setCart] = useState(null);
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [intentType, setIntentType] = useState('');
  const [contextSummary, setContextSummary] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const [budget, setBudget] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const mockClickCountRef = useRef(0);
  const mockTimerRef = useRef(null);

  // Hidden mock mode toggle: click the lightning bolt 5 times
  const handleMockToggle = () => {
    clearTimeout(mockTimerRef.current);
    mockClickCountRef.current += 1;
    if (mockClickCountRef.current >= 5) {
      setMockMode(m => !m);
      mockClickCountRef.current = 0;
    } else {
      mockTimerRef.current = setTimeout(() => {
        mockClickCountRef.current = 0;
      }, 3000);
    }
  };

  const handleSubmit = useCallback(async (input) => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(0);
    setBudget(input.budget_inr || null);

    const stepTimer1 = setTimeout(() => setLoadingStep(1), 1500);
    const stepTimer2 = setTimeout(() => setLoadingStep(2), 3000);

    try {
      const result = await parseContent(input, mockMode);
      setCart(result.cart || []);
      setUnavailableItems(result.unavailable_items || []);
      setTotalPrice(result.total_price_inr || 0);
      setBudgetExceeded(result.budget_exceeded || false);
      setIntentType(result.intent_type || 'general');
      setContextSummary(result.context_summary || '');
      setSummary(result.summary || '');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setCart(null);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep(0);
    }
  }, [mockMode]);

  const isEmpty = (!cart || cart.length === 0) && !isLoading;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 h-12 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-accent)' }}
          >
            <ShoppingCart size={14} color="#1A1915" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-semibold text-text-primary tracking-[-0.01em]">
            Context-to-Cart
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              color: 'var(--color-text-tertiary)',
              background: 'var(--color-bg-tertiary)',
            }}
          >
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <AnimatePresence>
            {mockMode && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-[11px] font-medium px-2 py-1 rounded-md"
                style={{
                  color: 'var(--color-warning)',
                  background: 'rgba(196, 168, 74, 0.1)',
                  border: '1px solid rgba(196, 168, 74, 0.15)',
                }}
              >
                Mock
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleMockToggle}
            className="p-1 rounded-md transition-colors duration-150"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Zap size={14} />
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="px-4 pt-3">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Main layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] xl:grid-cols-[380px_1fr_300px] gap-0 overflow-hidden">
        <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
        <CartPanel
          cart={cart}
          unavailableItems={unavailableItems}
          totalPrice={totalPrice}
          budgetExceeded={budgetExceeded}
          budget={budget}
          isLoading={isLoading}
          loadingStep={loadingStep}
          isEmpty={isEmpty}
        />
        <SummaryPanel
          intentType={intentType}
          contextSummary={contextSummary}
          summary={summary}
          cart={cart}
          unavailableItems={unavailableItems}
          totalPrice={totalPrice}
          isEmpty={isEmpty}
        />
      </main>
    </div>
  );
}
