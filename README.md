# ShopSathi — Multilingual AI Shop Assistant Frontend

This is a fully runnable React + Vite frontend prototype based on the supplied project workflow.

## Included
- Dashboard with inventory/low-stock/excess/expiry/pending-delivery metrics
- Multilingual language selector: English, Telugu, Hindi, Mixed
- Browser speech recognition (Chrome/Edge) for voice stock entry
- Text input fallback
- Mixed-language examples and parser
- Multiple-action extraction
- Per-action confidence + confirmation gate
- Inventory CRUD
- Low/critical/excess/expiry alerts
- Pending deliveries
- Explainable purchase recommendations
- "Ask your shop" conversational panel
- Browser text-to-speech
- Action history
- LocalStorage persistence
- Responsive UI
- Ready-to-connect architecture for FastAPI + SQLite + an LLM

## Run in VS Code

1. Install Node.js 18+.
2. Open this folder in VS Code.
3. Open Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the localhost URL shown by Vite.

## Important
The current frontend is intentionally self-contained so it works without an API key or backend. The parser and recommendation logic are deterministic demo logic.

For the final architecture in your project document, connect:
React/Vite → FastAPI → LLM API + SQLite

Move the `parse()` logic in `VoiceConsole` to a backend `/api/parse-action` endpoint and move `answerQuestion()` / `makeRecommendations()` to backend endpoints when you add the Python server.

## Voice
Use Chrome or Edge for the best browser SpeechRecognition support. If voice recognition is unavailable, type into the input box; all core demo flows still work.

## Suggested next backend endpoints
POST /api/parse-action
POST /api/confirm-actions
GET  /api/products
POST /api/products
PUT  /api/products/:id
GET  /api/alerts
GET  /api/recommendations
POST /api/ask
GET  /api/history
