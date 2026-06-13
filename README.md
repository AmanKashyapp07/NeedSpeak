# Context-to-Cart | Amazon Hackon 2026

> **Idea 1 Foundation** — Paste any recipe, shopping list, or URL. AI extracts what you need, maps to real products, builds your cart instantly.

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+ (with pip/venv)
- Node.js 18+ (or Bun)
- A Google Gemini API key **or** AWS CLI configured with credentials (`aws configure`)

> If using Gemini with `MOCK_AWS=1` you do **not** need any AWS account, DynamoDB tables, or S3 bucket.

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

> **DynamoDB seed (Full AWS only):** If running with `MOCK_AWS=0`, seed the product catalog:
> ```bash
> python seed_catalog.py
> ```
> This writes 80 realistic Indian product SKUs to DynamoDB. Safe to re-run.  
> With `MOCK_AWS=1` this step is unnecessary — the backend loads a built-in mock catalog automatically.

### 2. Configure Environment

Create `backend/.env`. The project supports two LLM providers and an independent AWS mock toggle so you can mix-and-match.

```env
# ─────────────────────────────────────────────────────────────────────────────
# LLM PROVIDER — Choose ONE: "gemini" or "bedrock"
# ─────────────────────────────────────────────────────────────────────────────
LLM_PROVIDER=gemini

# ─── Option A: Google Gemini (default, no AWS needed) ────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_ID=gemini-2.5-flash          # primary model (fallbacks: 2.5-flash-lite, 2.0-flash, 1.5-flash)

# ─── Option B: Amazon Bedrock (requires AWS credentials + inference profile) ─
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-6   # or the full inference profile ARN

# ─────────────────────────────────────────────────────────────────────────────
# AWS SERVICES (DynamoDB, S3)
# ─────────────────────────────────────────────────────────────────────────────
AWS_REGION=us-east-1
DYNAMODB_TABLE_PRODUCTS=ProductCatalog
DYNAMODB_TABLE_SESSIONS=CartSessions
S3_BUCKET=pulse-cart-sessions-shivam-2026

# MOCK_AWS — Set to 1 to skip all DynamoDB/S3/Bedrock calls.
# Uses an in-memory product catalog and session store instead.
# Auto-detected as 1 if no AWS credentials are found on the machine.
MOCK_AWS=1

# ─────────────────────────────────────────────────────────────────────────────
# MOCK_MODE — Set to 1 to bypass the LLM entirely (returns canned extractions)
# Useful for UI development or offline demos where you don't want any API calls.
# ─────────────────────────────────────────────────────────────────────────────
MOCK_MODE=0
```

#### Common team configurations

| Scenario | `LLM_PROVIDER` | `MOCK_AWS` | `MOCK_MODE` | Notes |
|----------|---------------|------------|-------------|-------|
| **Gemini + no AWS** (recommended) | `gemini` | `1` | `0` | Real AI extraction, mock product catalog. No AWS account needed. |
| **Full AWS** (production-like) | `bedrock` | `0` | `0` | Needs `aws configure`, DynamoDB tables, S3 bucket, Bedrock profile. |
| **Offline / UI dev only** | _(ignored)_ | `1` | `1` | Everything mocked, zero network calls. |
| **Bedrock + mock DB** | `bedrock` | `1` | `0` | Real Bedrock LLM calls, but mock catalog/sessions. |

### 3. Start the Backend
```bash
cd backend
pip install -r requirements.txt   # first time only
python -m uvicorn app.main:app --reload --port 8000
```
The API is live at `http://localhost:8000`. OpenAPI docs at `http://localhost:8000/docs`.

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The UI is live at `http://localhost:5173`. API calls are proxied to the backend.

## Architecture

```
User Input (text/URL) 
    |
    v
[Ingestion Layer] -- text_input / url_fetcher / youtube_fetcher
    |
    v
[Stage 1: AI Intent Extraction] -- Gemini 2.5 Flash / Claude Sonnet 4.6 -> structured JSON
    |
    v
[Stage 2: SKU Resolution] -- pure code, zero AI, keyword matching
    |
    v
[Stage 3: AI Cart Summary] -- Gemini 2.5 Flash / Claude Sonnet 4.6 -> plain English
    |
    v
Cart Response -> Frontend
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/parse` | Main pipeline: text/URL -> resolved cart |
| GET | `/api/session/{id}` | Reload a previous session |
| GET | `/api/health` | Check Bedrock + DynamoDB connectivity |

## Mock Mode

There are two independent mock flags:

| Flag | What it skips | When to use |
|------|--------------|-------------|
| `MOCK_AWS=1` | DynamoDB, S3, Bedrock health check | You don't have an AWS account. The backend uses an in-memory product catalog (~45 mock SKUs) and stores sessions in memory. |
| `MOCK_MODE=1` | All LLM calls (Gemini **and** Bedrock) | Offline demos or pure UI work. Returns canned extraction/summary data without any network call. |

Both flags are independent — you can use a live Gemini key while keeping AWS fully mocked.

> **Tip:** If `MOCK_AWS` is not set in `.env`, the backend auto-detects whether AWS credentials exist on the machine and mocks automatically if they don't.

## Bedrock Inference Profile Setup

Claude Sonnet 4.6 requires an inference profile in AWS Bedrock:

1. Go to **AWS Console > Amazon Bedrock > Inference profiles**
2. Click **Create inference profile**
3. Select `anthropic.claude-sonnet-4-6` as the model
4. Name it (e.g., `context-to-cart-sonnet`)
5. Copy the **Inference Profile ARN**
6. Update `BEDROCK_MODEL_ID` in `backend/.env` with the ARN

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Python 3.11 |
| Frontend | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| AI | Google Gemini API (default) / Amazon Bedrock (Claude Sonnet 4.6) |
| Database | Amazon DynamoDB (or local mock catalog) |
| Storage | Amazon S3 (or local mock session storage) |
