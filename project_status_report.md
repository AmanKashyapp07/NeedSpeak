# Context-to-Cart (needSpeak) — Project Status Report
**Date:** June 13, 2026  
**Status:** Functional (with Local Mock Mode & AWS Bedrock/DynamoDB/S3 integration)

---

## 1. Executive Summary
**Context-to-Cart** (housed in the `needSpeak` repository) is a web application designed for the Amazon Hackon 2026. The app allows users to paste any unstructured text—such as recipe ingredients, shopping lists, DIY repair instructions, or YouTube URLs—and automatically parses it to build an optimized shopping cart mapped to real, available products. 

The system features dynamic scaling based on servings, category-based SKU mapping, budget-constrained substitution optimization, and automated plain English cart summaries.

---

## 2. System Architecture & Flow

The application follows a structured three-stage pipeline:

```
                  User Input (Text or URL)
                             │
                             ▼
                    [Ingestion Layer]
         (processes plain text or fetches URLs/YouTube transcripts)
                             │
                             ▼
            [Stage 1: Bedrock Extraction]
         (Claude Sonnet 4.6 via Bedrock -> Structured JSON)
                             │
                             ▼
               [Stage 2: SKU Resolution]
    (Deterministic keyword & overlap matching against catalog;
      performs budget optimization/substitutions; No AI)
                             │
                             ▼
             [Stage 3: Bedrock Summarization]
         (Claude Sonnet 4.6 -> Plain English Cart Summary)
                             │
                             ▼
                  Response to Frontend
```

---

## 3. Backend Breakdown (`backend/`)

The backend is built with **FastAPI** (Python 3.11+) and integrates with Amazon Bedrock, DynamoDB, and S3.

### Core Modules and Components

*   **`main.py`** ([backend/app/main.py](file:///Users/amankashyap/Documents/needSpeak/backend/app/main.py))
    *   Defines routes, CORS policies, global exceptions, and orchestrates the pipeline.
    *   Launches the pipeline inside a thread pool with a 30-second timeout.
    *   **Endpoints:**
        *   `POST /api/parse`: Runs the ingestion, extraction, resolution, and summarization pipeline.
        *   `GET /api/session/{session_id}`: Retrieves previous session results from DynamoDB/S3.
        *   `GET /api/health`: Health status endpoint checking Amazon Bedrock, S3, and DynamoDB.
*   **`config.py`** ([backend/app/config.py](file:///Users/amankashyap/Documents/needSpeak/backend/app/config.py))
    *   Manages environment parameters (AWS Region, DynamoDB Table names, S3 bucket names, model IDs).
    *   Handles **`MOCK_MODE`** flag toggle.
*   **Ingestion Layer (`backend/app/ingestion/`)**
    *   `text_input.py`: Normalizes text inputs.
    *   `url_fetcher.py`: Standard web scraping using BeautifulSoup to extract recipe content from supported URLs.
    *   `youtube_fetcher.py`: Fetches transcripts from YouTube video URLs using `youtube-transcript-api`.
*   **Pipeline Layer (`backend/app/pipeline/`)**
    *   `bedrock_client.py`: Thread-safe Bedrock client initialization.
    *   `extractor.py` (Stage 1): Calls Claude Sonnet 4.6 to turn raw text/transcripts into a structured JSON shopping list (items, quantities, categories). Includes JSON validation/sanitization rules and a backup retry prompt.
    *   `resolver.py` (Stage 2): deterministic Python module mapping parsed items to catalog products. Uses exact matching, keyword overlap ratio, and category fallbacks. It also performs **budget-friendly substitutions** if a limit is set.
    *   `summarizer.py` (Stage 3): Uses Bedrock to generate a conversational summary of the resolved cart, substitutions, and unavailable items.
*   **Database & Storage (`backend/app/db/`)**
    *   `dynamo.py`: Manages connection to `ProductCatalog` (loaded into memory on startup for fast resolution) and `CartSessions` tables. Includes an extensive mock product catalog (80+ items) for testing.
    *   `s3.py`: Saves raw user inputs and resolved cart sessions to S3.
*   **Unit Conversions (`backend/app/unit_conversions.py`)**
    *   Parses, standardizes, and scales culinary/hardware unit measurements (e.g., cups, grams, units, packets) into base quantities.

### Bootstrap & Test Scripts
*   `seed_catalog.py` ([backend/seed_catalog.py](file:///Users/amankashyap/Documents/needSpeak/backend/seed_catalog.py)): A seeding utility script containing 80 realistic Indian product SKUs to bootstrap the DynamoDB product catalog.
*   `test_e2e.py` ([backend/test_e2e.py](file:///Users/amankashyap/Documents/needSpeak/backend/test_e2e.py)): End-to-end integration tests simulating recipe extraction, budget limits, school supplies, and health checks.

---

## 4. Frontend Breakdown (`frontend/`)

The frontend is built with **React 18** and **Vite 6** using **Tailwind CSS v4** and **Framer Motion** for premium styling and micro-animations.

### Key Directory Structure

*   **`src/App.jsx`** ([frontend/src/App.jsx](file:///Users/amankashyap/Documents/needSpeak/frontend/src/App.jsx))
    *   Coordinates overall state (cart, unavailable items, totals, budget parameters, loader states, mock mode status).
    *   Includes a hidden toggle for Mock Mode (clicking the lightning bolt icon in the top header 5 times).
*   **Components (`frontend/src/components/`)**
    *   `input/InputPanel.jsx`: Contains the input form allowing users to switch between standard text inputs, URLs, or setting budget overrides and servings scaling.
    *   `cart/CartPanel.jsx`: Renders the shopping cart items, highlights substituted items, and displays lists of unavailable items.
    *   `cart/SummaryPanel.jsx`: Displays the contextual summary of the parsed list.
    *   `common/LoadingState.jsx`: Animated transitions showing the stage progression (parsing, matching, summarizing).
    *   `common/ErrorBanner.jsx`: Friendly UI alerts for failure scenarios.
*   **API Client (`frontend/src/services/api.js`)**
    *   Handles asynchronous communication with the FastAPI server, appending the `X-Mock-Mode` header if requested.

---

## 5. Deployment Configurations

*   **`campusflow.service`** ([campusflow.service](file:///Users/amankashyap/Documents/needSpeak/campusflow.service))
    *   Systemd service script configured to run the FastAPI backend via uvicorn on Ubuntu.
*   **`nginx.conf`** ([nginx.conf](file:///Users/amankashyap/Documents/needSpeak/nginx.conf))
    *   Reverse proxy configuration serving the frontend build directory (`dist`) and mapping `/api/` traffic directly to FastAPI.

---

## 6. How to Run the Project Locally

### 1. Configure the Environment
Ensure your `.env` is set up in `backend/.env` with Bedrock profile ARN and S3 bucket identifiers. If you do not have AWS services set up, you can run in mock mode by setting:
```env
MOCK_MODE=1
```

### 2. Start the Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.
