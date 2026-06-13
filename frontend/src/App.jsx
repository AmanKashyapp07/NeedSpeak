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

  // Hidden mock mode toggle
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
    <div className="h-screen bg-bg-deep flex flex-col font-sans overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-sm">
            <ShoppingCart size={16} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Context-to-Cart
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">v2.0</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mockMode && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200 tracking-wide uppercase">
              Mock Mode
            </span>
          )}
          <button onClick={handleMockToggle} className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100" title="Toggle Mock Mode">
            <Zap size={16} />
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="px-6 pt-4 shrink-0">
          <ErrorBanner error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Three-panel layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto p-4 md:p-6 min-h-0">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-0 h-full">
          <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Center Column: Cart */}
        <div className="lg:col-span-5 xl:col-span-6 flex flex-col min-h-0 h-full">
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
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col min-h-0 h-full">
          <SummaryPanel
            intentType={intentType}
            contextSummary={contextSummary}
            summary={summary}
            cart={cart}
            unavailableItems={unavailableItems}
            totalPrice={totalPrice}
            isEmpty={isEmpty}
          />
        </div>

      </main>
    </div>
  );
}
