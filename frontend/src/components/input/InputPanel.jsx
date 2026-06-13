import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Link, Sparkles, Users, Wallet, ChevronDown, AlertTriangle } from 'lucide-react';

const MAX_TEXT_LENGTH = 15_000;
const MIN_TEXT_LENGTH = 5;
const MAX_SERVINGS = 100;
const MAX_BUDGET = 100_000;
const URL_REGEX = /^https?:\/\/.+\..+/i;

const QUICK_EXAMPLES = [
  {
    label: 'Chicken Biryani',
    text: 'Chicken Biryani Recipe for 4 people:\n\nIngredients:\n- 500g basmati rice\n- 750g chicken (bone-in pieces)\n- 3 large onions, thinly sliced\n- 2 tomatoes, chopped\n- 1 cup yogurt\n- 4 tbsp oil or ghee\n- 2 tbsp ginger-garlic paste\n- 1 tsp turmeric powder\n- 2 tsp red chili powder\n- 1 tbsp biryani masala\n- 1 tsp garam masala\n- Salt to taste\n- Fresh mint leaves\n- Fresh coriander leaves\n- 4 green chilies\n- 2 bay leaves\n- 4 cloves\n- 4 cardamom pods\n- 1 inch cinnamon stick\n- A pinch of saffron in 2 tbsp warm milk',
  },
  {
    label: 'Party Snacks',
    text: 'bhai kal party hai, chips, cold drinks, popcorn le aana for 6 people roughly 400 rupay mein',
  },
  {
    label: 'School Supplies',
    text: 'School supplies list for new session:\n- 5 notebooks (ruled, 180 pages)\n- 1 pack of pencils\n- 1 pack of blue pens\n- 2 erasers\n- 1 sharpener\n- 1 geometry box\n- 1 set of colored pencils',
  },
  {
    label: 'Fix Leaky Tap',
    text: 'How to fix a leaky tap:\nYou will need: adjustable wrench, PTFE plumber tape, screwdriver set. Turn off water supply, remove tap handle using screwdriver, replace washer, wrap threads with PTFE tape, reassemble and test.',
  },
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
    if (!trimmed) return 'Please enter some text or a URL.';
    if (inputType === 'url') {
      if (!URL_REGEX.test(trimmed)) return 'Please enter a valid URL starting with http:// or https://';
    } else {
      if (trimmed.length < MIN_TEXT_LENGTH) return `Text is too short (minimum ${MIN_TEXT_LENGTH} characters).`;
      if (trimmed.length > MAX_TEXT_LENGTH) return `Text is too long (${trimmed.length.toLocaleString()} / ${MAX_TEXT_LENGTH.toLocaleString()}).`;
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
    if (error) { setValidationError(error); return; }
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
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ borderRight: '1px solid var(--color-border)' }}
    >
      {/* Header area */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
          What do you need?
        </h2>
        <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
          Paste a recipe, shopping list, or URL. AI builds your cart.
        </p>
      </div>

      {/* Input type toggle */}
      <div className="px-5 pb-3">
        <div
          className="flex rounded-lg p-0.5"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          {['text', 'url'].map((type) => (
            <button
              key={type}
              onClick={() => setInputType(type)}
              className="flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-md text-[12px] font-medium transition-all duration-150"
              style={
                inputType === type
                  ? {
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }
                  : { color: 'var(--color-text-tertiary)' }
              }
            >
              {type === 'text' ? <Type size={13} /> : <Link size={13} />}
              {type === 'text' ? 'Text' : 'URL'}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-5 pb-4 gap-3 overflow-hidden">
        {inputType === 'text' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              id="text-input"
              value={content}
              onChange={handleContentChange}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Paste your recipe, shopping list, or any text with items to buy..."
              className="flex-1 w-full p-3.5 rounded-xl text-[13px] leading-relaxed resize-none focus:outline-none transition-colors duration-150"
              style={{
                background: 'var(--color-bg-input)',
                color: 'var(--color-text-primary)',
                border: `1px solid ${validationError ? 'var(--color-danger)' : 'var(--color-border)'}`,
              }}
              onFocus={(e) => {
                if (!validationError) e.target.style.borderColor = 'var(--color-border-strong)';
              }}
              onBlur={(e) => {
                if (!validationError) e.target.style.borderColor = 'var(--color-border)';
              }}
              disabled={isLoading}
            />
            {content.length > 0 && (
              <span className="text-[10px] text-text-tertiary self-end mt-1.5 tabular-nums">
                {content.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
              </span>
            )}
          </div>
        ) : (
          <input
            id="url-input"
            type="url"
            value={content}
            onChange={handleContentChange}
            placeholder="https://www.allrecipes.com/recipe/..."
            className="w-full p-3.5 rounded-xl text-[13px] focus:outline-none transition-colors duration-150"
            style={{
              background: 'var(--color-bg-input)',
              color: 'var(--color-text-primary)',
              border: `1px solid ${validationError ? 'var(--color-danger)' : 'var(--color-border)'}`,
            }}
            onFocus={(e) => {
              if (!validationError) e.target.style.borderColor = 'var(--color-border-strong)';
            }}
            onBlur={(e) => {
              if (!validationError) e.target.style.borderColor = 'var(--color-border)';
            }}
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
              className="flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg"
              style={{ background: 'rgba(204, 117, 117, 0.08)', color: 'var(--color-danger)' }}
            >
              <AlertTriangle size={12} />
              {validationError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-1.5 text-[12px] transition-colors duration-150 self-start"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <ChevronDown
            size={13}
            style={{
              transform: showOptions ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s ease',
            }}
          />
          Options
        </button>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex gap-3 overflow-hidden"
            >
              <div className="flex-1">
                <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  <Users size={10} /> Servings
                </label>
                <input
                  id="servings-input"
                  type="number"
                  min="1"
                  max={MAX_SERVINGS}
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                  className="w-full p-2.5 rounded-lg text-[13px] focus:outline-none transition-colors duration-150"
                  style={{
                    background: 'var(--color-bg-input)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] mb-1 flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  <Wallet size={10} /> Budget (Rs.)
                </label>
                <input
                  id="budget-input"
                  type="number"
                  min="50"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  className="w-full p-2.5 rounded-lg text-[13px] focus:outline-none transition-colors duration-150"
                  style={{
                    background: 'var(--color-bg-input)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          id="submit-button"
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-accent)'}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full"
              style={{ border: '2px solid rgba(26, 25, 21, 0.2)', borderTopColor: 'var(--color-text-inverse)' }}
            />
          ) : (
            <>
              <Sparkles size={14} />
              Build Cart
            </>
          )}
        </motion.button>
      </form>

      {/* Quick examples */}
      <div className="px-5 pb-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="text-[11px] font-medium mt-3 mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
          Try an example
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExample(ex)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-md text-[11px] transition-colors duration-150 disabled:opacity-40"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-tertiary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
                e.currentTarget.style.background = 'var(--color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
