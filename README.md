# Cloudilic – Workflow RAG App (Frontend)

React + TypeScript + Vite app that lets you build a simple workflow with drag‑and‑drop blocks (React Flow) to ask questions about a PDF via a RAG pipeline. This README documents how to run the frontend, the expected backend API, and how to use the app to complete the assessment requirements.

## What’s included

- React Flow canvas with 3 draggable nodes:
  - Input Node: multi‑line text prompt input and a Run button
  - RAG Node: PDF upload to index for retrieval
  - Output Node: formatted AI responses with chat history
- Connect nodes to define a flow (e.g., Input → RAG → Output)
- Run Flow button executes the pipeline
- Session memory via sessionId (persisted in localStorage)
- Backend Health Indicator in sidebar header with latency and tooltip
- Vite + TypeScript + ESLint, Tailwind (v4) UI primitives, lucide icons

## Requirements coverage

- Drag‑and‑drop nodes: Done
- Connect nodes (input → rag → output): Done
- Run executes: prompt → optional PDF context → chat API → output: Done
- Multi‑line input: Done
- Upload PDF + index chunk count shown: Done
- Output shows formatted response + chat history: Done
- OpenAI usage: Provided via backend contract (frontend calls a generic /chat)
- Short‑term memory: sessionId persisted for follow‑ups (Reset Session available)

## Architecture overview

- UI built with React and React Flow (@xyflow/react)
- The frontend calls a backend (not part of this package) using three endpoints:
  - GET /health
  - POST /upload-pdf (multipart/form-data)
  - POST /chat (application/json)
- Base URL comes from the environment variable `VITE_API_URL`

See API contract below to implement the backend in Node.js + TypeScript with your preferred libraries (e.g., OpenAI SDK, pdf-parse, vector DB).

## Prerequisites

- Node.js 18+ (recommended 20+)
- pnpm (preferred) or npm

## Quick start (frontend)

```bash
# Install deps
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Typecheck and build
pnpm build

# Preview production build
pnpm preview
```

Environment variables:

- `VITE_API_URL` — Base URL for the backend. If omitted, the app calls relative paths (same origin), e.g. `/chat`.

Create a `.env` file at the project root if needed:

```
VITE_API_URL=http://localhost:3000
```

## Expected backend API (contract)

The frontend expects these endpoints. You can implement them with Express/Fastify/Hono, etc.

1) GET /health
- Purpose: Liveness/latency check for the Health Indicator.
- Response: 200 OK with JSON (any shape). The frontend records latency and maps status:
  - up: HTTP 200 and latency ≤ 1500ms
  - degraded: HTTP 200 but latency > 1500ms
  - down: non‑OK response, error, timeout (5s)

2) POST /upload-pdf
- Content-Type: multipart/form-data with field `file` (PDF only)
- Response JSON:
```
{
  "documentId": "string",        // required
  "chunkCount": 123                // optional, shown in UI if present
}
```
- Notes:
  - Client enforces PDF MIME type and a max size of 50MB.

3) POST /chat
- Content-Type: application/json
- Request JSON:
```
{
  "prompt": "string",            // required
  "documentId": "string?",       // optional, present if RAG node provided a PDF
  "sessionId": "string?"         // optional, for short-term memory across turns
}
```
- Response JSON:
```
{
  "answer": "string",            // required, final model output
  "sessionId": "string",         // required, persist for follow‑ups
  "retrievedCount": 5             // optional, how many chunks were used
}
```

CORS: enable it for your frontend origin in development. The health check aborts after 5s; chat/upload use default browser timeouts unless your backend enforces its own.

## Using the app

1) Add nodes
- From the left sidebar, drag these onto the canvas:
  - Input
  - RAG (optional)
  - Output

2) Connect nodes
- Draw edges to form: Input → (RAG) → Output
- You can delete selected edges with Delete/Backspace.

3) Enter a prompt
- Click the Input node and type a multi‑line question.

4) Upload a PDF (optional)
- Click the RAG node button and choose a PDF. When indexed, the UI shows the file name and chunk count (if provided by backend).

5) Run the flow
- Click the global “Run Flow” button (top‑right) or the Input node’s “Run” button.
- The Output node will display loading, then show the assistant answer. It also keeps a minimal chat history (you and assistant turns) and the retrieved chunk count if provided.

6) Reset session
- Use the “Reset Session” button (top‑right) to clear the stored sessionId and chat history.

## Health Indicator

- Polls `GET /health` every 20 seconds
- Shows green/yellow/red status and latest latency in ms
- Hover/focus shows last checked time and any error message
- Click to force an immediate refresh

Thresholds (from code):
- Timeout: 5000ms (health check)
- Degraded latency: >1500ms

## Configuration notes

- Base URL: `VITE_API_URL` controls where requests are sent. If omitted, the app calls relative paths like `/chat`, `/upload-pdf`, `/health` against the same origin.
- Prompt length: Frontend validates a maximum of 4000 characters.
- Session storage key: `workflow.sessionId` in `localStorage`.

## Tech stack

- React 19, TypeScript, Vite 7
- React Flow: `@xyflow/react`
- Tailwind CSS v4, shadcn‑style UI primitives
- Icons: `lucide-react`
- Linting: ESLint (typescript‑eslint)

## Implementing the backend (outline)

Your Node.js + TypeScript backend should:
- Extract text from PDFs (e.g., pdf-parse), chunk and embed to a vector DB (e.g., pgvector / SQLite-Faiss / in‑memory for demo)
- Expose the endpoints described above
- Use OpenAI (or a compatible model) to generate `answer`, optionally using retrieved context
- Maintain a simple session store keyed by `sessionId` (short‑term memory)

Environment variables (backend):
- `OPENAI_API_KEY` (or a compatible provider key)
- Vector DB / storage configuration

## Deployment

- Frontend: any static host (Vercel/Netlify/etc.). Provide `VITE_API_URL` in the environment.
- Backend: Node host (Render/Fly/Heroku/Vercel functions/Docker). Ensure CORS and the three routes are reachable by the frontend.

## Accessibility

- Input and buttons are labelled and keyboard accessible
- Output content is selectable and prevents accidental node drag while selecting text
- Health indicator uses `aria-live="polite"` to announce status changes

## Troubleshooting

- Health is red: check `VITE_API_URL` and that `/health` responds quickly
- PDF upload fails: ensure server accepts `multipart/form-data` at `/upload-pdf` and returns `documentId`
- Chat fails: verify `/chat` CORS, JSON body parsing, and that a JSON response includes `answer` and `sessionId`

## License

MIT (or as specified by your organization).
