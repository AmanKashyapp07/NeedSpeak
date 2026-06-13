import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Link, Sparkles, Users, Wallet, ChevronDown, AlertTriangle } from 'lucide-react';

const MAX_TEXT_LENGTH = 15_000;
const MIN_TEXT_LENGTH = 5;
const MAX_SERVINGS = 100;
const MAX_BUDGET = 100_000;

const URL_REGEX = /^https?:\/\/.+\..+/i;

const QUICK_EXAMPLES = [
  { label: 'Chicken Biryani', text: 'Chicken Biryani Recipe for 4 people:\n\nIngredients:\n- 500g basmati rice\n- 750g chicken\n- 3 large onions\n- 2 tomatoes\n- 1 cup yogurt\n- 4 tbsp oil or ghee\n- 2 tbsp ginger-garlic paste\n- 1 tsp turmeric powder\n- 2 tsp red chili powder\n- 1 tbsp biryani masala\n- 1 tsp garam masala\n- Salt to taste\n- Fresh mint leaves\n- Fresh coriander leaves\n- 4 green chilies' },
  { label: 'Party Snacks', text: 'bhai kal party hai, chips, cold drinks, popcorn le aana for 6 people roughly 400 rupay mein' },
  { label: 'School Supplies', text: 'School supplies list:\n- 5 notebooks (ruled, 180 pages)\n- 1 pack of pencils\n- 1 pack of blue pens\n- 2 erasers\n- 1 sharpener\n- 1 geometry box\n- 1 set of colored pencils' },
  { label: 'Fix Leaky Tap', text: 'How to fix a leaky tap:\nYou will need: adjustable wrench, PTFE plumber tape, screwdriver set. Turn off water supply, remove tap handle using screwdriver, replace washer, wrap threads with PTFE tape, reassemble and test.' },
];

export default function InputPanel({ onSubmit, isLoading }) {
  const [inputType, setInputType] = useState('text');
  const [content, setContent] = useState('');
  const [servings, setServings] = useState('');
  const [budget, setBudget] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    const trimmed = content.trim();

    if (!trimmed) {
      return 'Please enter some text or a URL.';
    }

    if (inputType === 'url') {
      if (!URL_REGEX.test(trimmed)) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
    } else {
      if (trimmed.length < MIN_TEXT_LENGTH) {
        return `Text is too short (minimum ${MIN_TEXT_LENGTH} characters).`;
      }
      if (trimmed.length > MAX_TEXT_LENGTH) {
        return `Text is too long. Please shorten it.`;
      }
    }

    if (servings) {
      const s = parseInt(servings);
      if (isNaN(s) || s < 1) return 'Servings must be at least 1.';
      if (s > MAX_SERVINGS) return `Servings cannot exceed ${MAX_SERVINGS}.`;
    }
    if (budget) {
      const b = parseInt(budget);
      if (isNaN(b) || b < 10) return 'Budget must be at least ₹10.';
      if (b > MAX_BUDGET) return `Budget cannot exceed ₹${MAX_BUDGET.toLocaleString()}.`;
    }

    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');

    onSubmit({
      input_type: inputType,
      content: content.trim(),
      servings_override: servings ? parseInt(servings) : undefined,
      budget_inr: budget ? parseInt(budget) : undefined,
    });
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (validationError) setValidationError('');
  };

  const handleExample = (example) => {
    setInputType('text');
    setContent(example.text);
    setValidationError('');
  };

  return (
    <div className="glass-panel w-full h-full flex flex-col p-5 gap-4 bg-white overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">What do you need?</h2>
        <p className="text-sm text-slate-500">Paste any text or URL to build your cart instantly.</p>
      </div>

      {/* Input type toggle */}
      <div className="flex bg-slate-100 rounded-lg p-1 w-full">
        <button
          onClick={() => setInputType('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
            inputType === 'text'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Type size={16} /> Text
        </button>
        <button
          onClick={() => setInputType('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-all ${
            inputType === 'url'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Link size={16} /> URL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {inputType === 'text' ? (
          <textarea
            value={content}
            onChange={handleContentChange}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Paste your recipe, shopping list, WhatsApp message, or any text..."
            className="w-full flex-1 min-h-[150px] p-4 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white transition-all font-sans border border-slate-200 shadow-inner"
            disabled={isLoading}
          />
        ) : (
          <input
            type="url"
            value={content}
            onChange={handleContentChange}
            placeholder="https://www.allrecipes.com/recipe/..."
            className="w-full p-4 rounded-xl text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white transition-all border border-slate-200 shadow-inner"
            disabled={isLoading}
          />
        )}

        {/* Validation error */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg bg-red-50 text-red-600 border border-red-100"
            >
              <AlertTriangle size={16} />
              {validationError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start w-fit px-2 py-1 rounded-md hover:bg-slate-100"
        >
          <ChevronDown size={16} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          Advanced Options
        </button>

        {/* Advanced Options */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col sm:flex-row gap-3 overflow-hidden"
            >
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <Users size={12} /> Servings
                </label>
                <input
                  type="number"
                  min="1"
                  max={MAX_SERVINGS}
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full p-2.5 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white border border-slate-200"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                  <Wallet size={12} /> Budget (Rs.)
                </label>
                <input
                  type="number"
                  min="50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:bg-white border border-slate-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover shadow-md mt-2"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <Sparkles size={18} />
              Build Cart
            </>
          )}
        </motion.button>
      </form>

      {/* Quick examples */}
      <div className="mt-2 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => handleExample(ex)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors disabled:opacity-50 border border-slate-200"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
