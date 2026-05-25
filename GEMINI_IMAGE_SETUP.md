# Gemini image generation (Nano Banana 2 + Batch)

Cover images use **Gemini Batch API** when generating multiple sets (Automate download). Single retries use standard (sync) API.

## Environment variables

```env
# Required for Gemini images (batch + sync)
GEMINI_API_KEY=your_key_from_https://aistudio.google.com/apikey

# Optional — defaults shown
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image-preview
# Optional — defaults to GEMINI_IMAGE_MODEL (free tier). Pro needs paid quota:
# GEMINI_PROMPT_TAB_IMAGE_MODEL=gemini-3-pro-image-preview
GEMINI_IMAGE_ASPECT_RATIO=3:4
GEMINI_IMAGE_SIZE=2K

# Batch polling (client + server)
GEMINI_BATCH_POLL_INTERVAL_MS=5000
GEMINI_BATCH_MAX_WAIT_MS=1800000

# Still required for prompt text (OpenAI Responses → image prompt)
OPENAI_API_KEY=sk-...
```

Without `GEMINI_API_KEY`, the app falls back to **Vertex Imagen** (if `GOOGLE_CLOUD_PROJECT` is set) or **OpenAI `gpt-image-1-mini`**.

## Pricing (Google Batch = ~50% off)

| 2K image | Standard | Batch |
|----------|----------|-------|
| Nano Banana 2 | ~$0.101 | ~$0.050 |

Batch turnaround is often minutes; SLA up to 24 hours. See [Batch API](https://ai.google.dev/gemini-api/docs/batch-api).

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/openai/cover-image` | One image (sync Gemini if key set) |
| `POST /api/openai/cover-image/batch` | Start batch job for many images |
| `GET /api/openai/cover-image/batch?jobName=...` | Poll until images are ready |
| `POST /api/gemini/generate-image` | Prompt tab: Gemini → Vertex → OpenAI if Gemini quota hit |

Prompt tab **Generate** uses Nano Banana 2 first. If Gemini returns 429 (free tier exhausted), it automatically tries **Vertex Imagen** (`GOOGLE_CLOUD_PROJECT`) then **OpenAI** (`OPENAI_API_KEY`).

## Automate flow

1. Fetch all set titles (parallel).
2. `POST /api/openai/cover-image/batch` with all titles.
3. Poll batch every 5s until done.
4. Build card PNGs and ZIP.
