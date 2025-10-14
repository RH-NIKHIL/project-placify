# Gemini AI Integration (Chat + SVG Images)

This project includes backend‑proxied integration with Google Gemini for two capabilities:

1. Conversational AI assistant (text)
2. Prompt‑based SVG image generation (sanitized for safety)

## Overview (Chat)
The frontend never calls Gemini directly. Instead it POSTs conversation history to:
```
POST /api/ai/chat
Content-Type: application/json
Authorization: Bearer <JWT>  (optional if you later add auth middleware)
{
  "messages": [
    { "role": "user" | "assistant", "content": "..." },
    ...
  ]
}
```
The server (route: `backend/routes/ai.js`) truncates to the last 12 messages, prepends a system preamble, and calls the Gemini model.

## Setup Steps
1. Install dependency (run inside `backend/` folder) if not already installed:
   ```
   npm install @google/generative-ai
   ```
2. Create a `.env` file in `backend/` (if not already) and add:
   ```
  GEMINI_API_KEY=YOUR_API_KEY_HERE
  # Optional overrides (defaults chosen automatically with fallback & discovery):
  GEMINI_MODEL=gemini-1.5-flash
  GEMINI_IMAGE_MODEL=gemini-1.5-flash
   ```
3. Restart the backend server so the new env vars load.

## Security Notes
- Never expose `GEMINI_API_KEY` to the frontend or commit it to version control.
- Only minimal conversation history (last 12 messages) is sent to control token usage and latency.
- Image generation prompt + produced SVG are sanitized server‑side; the raw model output is never injected directly.
- Add rate limiting or auth middleware if you want to restrict who can call the AI or image routes.
- SVG sanitization removes: `<script>`, event handler attributes (`on*`), `<foreignObject>`, and any `href="javascript:` URIs.

## Frontend Usage (Chat)
The `aiAPI.chat(messages)` function (in `src/services/api.js`) sends the entire current message array. The `UserDashboard` component appends the user message locally then awaits the AI reply.

Example code path:
- UserDashboard `handleSendMessage` builds history and calls `aiAPI.chat`.
- Response is appended to the `messages` state.

## Error Handling (Chat)
If the key is missing or an upstream error occurs, the chat route returns:
```
500 { "message": "AI request failed", "error": "<details>" }
```
Frontend converts that into a chat bubble with the error text.

## Image Generation (SVG)
Endpoint:
```
POST /api/images/generate
Content-Type: application/json
Authorization: Bearer <JWT optional>
{ "prompt": "A minimal flat icon of a rocket launching" }
```
Behavior:
- Selects Gemini image-capable text model (default `gemini-1.5-flash` unless overridden).
- Prompts model to return JSON of shape `{ "svg": "<svg ...>...</svg>" }`.
- Parses JSON, sanitizes the SVG, and returns `{ svg: "<svg ...>" }` to the client.
- Enforces basic size constraints (width/height fallbacks, max dimensions clamp) and strips unsafe content.

Frontend Consumption:
- `imageAPI.generate(prompt)` returns either `data.svg` (preferred) which `UserDashboard` injects with `dangerouslySetInnerHTML` (safe because server sanitized).

Scoring / Gamification:
- Chat message processed: `+1` score, increments `aiMessages`.
- SVG image generated: `+3` score, increments `imagesGenerated`.
- Resume created: `+5` score, increments `resumesCreated`.

Error Responses (image route):
```
400 { "message": "Prompt is required" }
500 { "message": "Image generation failed", "error": "<details>" }
500 { "message": "GEMINI_API_KEY not configured" }
```

## Debug & Model Discovery
The chat route performs dynamic model discovery (fetching the public models list) and attempts a prioritized fallback list. Debug endpoints:
```
GET /api/ai/models   # Returns discovered model names
GET /api/ai/debug    # Returns last discovery snapshot and attempt errors
```
You can force a model for a single request by sending `forceModel` in the chat POST body.

## Future Enhancements
- Streaming responses (use the Gemini streaming API) for chat and possibly progressive SVG hints.
- Add per-user conversation & image prompt persistence in MongoDB.
- Implement moderation / content filtering before returning model output.
- Introduce token usage & latency metrics dashboard.
- Add server-side SVG unit tests (ensure sanitizer strips disallowed content).

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| 500 GEMINI_API_KEY not configured | Missing env var | Add key to backend/.env and restart |
| AI request failed | Network or quota issue | Check server logs & Google AI quota |
| Slow responses | Large prompts or network latency | Reduce retained messages or switch to lighter model |
| Image generation failed | Invalid JSON or model output change | Inspect server logs; adjust prompt enforcing JSON shape |
| Unsafe SVG blocked | Sanitizer stripped required attrs | Review sanitization rules; whitelist minimal safe attributes |

---
Last updated: (Gemini chat + SVG integration doc refreshed)
