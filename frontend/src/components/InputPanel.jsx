import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Link, Sparkles, Users, Wallet, ChevronDown, AlertTriangle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
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
        return `Text is too short (minimum ${MIN_TEXT_LENGTH} characters). Paste a recipe or shopping list.`;
      }
      if (trimmed.length > MAX_TEXT_LENGTH) {
        return `Text is too long (${trimmed.length.toLocaleString()} / ${MAX_TEXT_LENGTH.toLocaleString()} chars). Please shorten it.`;
      }
    }

    // Numeric range checks
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
    if (validationError) setValidationError('');   // clear on typing
  };

  const handleExample = (example) => {
    setInputType('text');
    setContent(example.text);
    setValidationError('');
  };

  return (
    <div className="glass-panel h-full flex flex-col p-5 gap-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold gradient-text">Context-to-Cart</h2>
        <p className="text-xs text-text-secondary mt-1">
          Paste a recipe, shopping list, or URL to build your cart instantly.
        </p>
      </div>

      {/* Input type toggle */}
      <div className="flex rounded-lg p-1" style={{ background: 'var(--color-bg-deep)' }}>
        <button
          onClick={() => setInputType('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
            inputType === 'text'
              ? 'bg-accent text-bg-deep shadow-lg'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Type size={14} /> Text
        </button>
        <button
          onClick={() => setInputType('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${
            inputType === 'url'
              ? 'bg-accent text-bg-deep shadow-lg'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Link size={14} /> URL
        </button>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
        {inputType === 'text' ? (
          <>
            <textarea
              id="text-input"
              value={content}
              onChange={handleContentChange}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Paste your recipe, shopping list, WhatsApp message, or any text with items to buy..."
              className="flex-1 w-full p-4 rounded-xl text-sm bg-bg-deep text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              style={{
                border: `1px solid ${validationError ? 'var(--color-danger, #F87171)' : 'var(--color-border)'}`,
                minHeight: '200px',
              }}
              disabled={isLoading}
            />
            {content.length > 0 && (
              <span className="text-[10px] text-text-muted self-end -mt-1">
                {content.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
              </span>
            )}
          </>
        ) : (
          <input
            id="url-input"
            type="url"
            value={content}
            onChange={handleContentChange}
            placeholder="https://www.allrecipes.com/recipe/..."
            className="w-full p-4 rounded-xl text-sm bg-bg-deep text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            style={{
              border: `1px solid ${validationError ? 'var(--color-danger, #F87171)' : 'var(--color-border)'}`,
            }}
            disabled={isLoading}
          />
        )}

        {/* Validation error */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'var(--color-danger, #F87171)' }}
          >
            <AlertTriangle size={13} />
            {validationError}
          </motion.div>
        )}

        {/* Options toggle */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors self-start"
        >
          <ChevronDown size={14} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          Options
        </button>

        {/* Options */}
        {showOptions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-3"
          >
            <div className="flex-1">
              <label className="text-[11px] text-text-muted mb-1 flex items-center gap-1">
                <Users size={11} /> Servings
              </label>
              <input
                id="servings-input"
                type="number"
                min="1"
                max={MAX_SERVINGS}
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
                className="w-full p-2.5 rounded-lg text-sm bg-bg-deep text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30"
                style={{ border: '1px solid var(--color-border)' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-text-muted mb-1 flex items-center gap-1">
                <Wallet size={11} /> Budget (Rs.)
              </label>
              <input
                id="budget-input"
                type="number"
                min="50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="500"
                className="w-full p-2.5 rounded-lg text-sm bg-bg-deep text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/30"
                style={{ border: '1px solid var(--color-border)' }}
              />
            </div>
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          id="submit-button"
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #FF6B00 100%)',
            color: 'var(--color-bg-deep)',
            boxShadow: content.trim() ? '0 4px 20px rgba(255, 153, 0, 0.25)' : 'none',
          }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-bg-deep/30 border-t-bg-deep rounded-full"
            />
          ) : (
            <>
              <Sparkles size={16} />
              Build Cart
            </>
          )}
        </motion.button>
      </form>

      {/* Quick examples */}
      <div>
        <p className="text-[11px] text-text-muted mb-2">Quick examples:</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExample(ex)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full text-[11px] text-text-secondary hover:text-accent hover:bg-accent/10 transition-all disabled:opacity-40"
              style={{ border: '1px solid var(--color-border)' }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
