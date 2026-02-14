# Daylight Support Assistant

An AI-powered customer support chatbot for [Daylight Computer](https://daylightcomputer.com), built with React, TypeScript, and Supabase.

The assistant uses Retrieval-Augmented Generation (RAG) to answer customer questions about the DC-1 computer, Sol:OS, accessories, orders, and more — drawing from a curated knowledge base of support guides and FAQ content.

## Screenshots

<img width="480" alt="Daylight Support Assistant chat interface" src="https://github.com/user-attachments/assets/96b633ca-f6ea-4db5-bf77-428942c673a6" /></br>

<img width="400" alt="Chat with source citations" src="https://github.com/user-attachments/assets/70cc1b8b-67a0-445d-913b-da44e5a86744" />

<img width="400" alt="Chat with source citations" src="https://github.com/user-attachments/assets/40965856-742f-49fc-bb9e-ce21d6e2ab62" />

## Features

- **AI Chat** — Streaming responses powered by Google Gemini 2.5 Flash
- **RAG Pipeline** — Postgres full-text search retrieves relevant knowledge base articles to ground responses
- **87 FAQ Q&A Pairs** — Covering Order, Device, Software, Company, Health, Work With Us, and more
- **12 Support Guides** — Detailed guides from support.daylightcomputer.com
- **Source Citations** — Answers link back to source articles
- **Conversation History** — Persisted locally with sidebar navigation
- **Analytics Dashboard** — Track chat interactions, ticket volume, and deflection rates
- **Suggestion Chips** — Quick-start prompts for common questions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase — Postgres database, Edge Functions
- **AI**: Google Gemini 2.5 Flash (via Google AI API)
- **Search**: Postgres `tsvector` full-text search (no external embeddings needed)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) (`npm install -g supabase`)
- [Deno](https://deno.land/) (for edge function development)
- A Supabase project (free tier works) — [create one here](https://supabase.com/dashboard)
- A Google Cloud API key for Gemini — [get one here](https://aistudio.google.com/app/apikey)

## Local Setup

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install frontend dependencies

```sh
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

You can find these values in your Supabase dashboard under **Project Settings → API**.

### 4. Link to your Supabase project

```sh
supabase login
supabase link --project-ref <your-project-ref>
```

### 5. Run database migrations

Apply the schema (tables, RLS policies, functions) to your Supabase project:

```sh
supabase db push
```

This creates the `knowledge_base`, `chat_interactions`, and `support_tickets` tables along with the `search_knowledge_base` RPC function and full-text search triggers.

### 6. Set edge function secrets

The `chat` edge function requires a `GEMINI_API_KEY` secret for Google's Gemini API:

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set it in your Supabase project:

```sh
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>
```

> **Note**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in edge functions — you don't need to set them.

### 7. Deploy edge functions

Deploy all edge functions to your Supabase project:

```sh
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy chat
supabase functions deploy seed-data
```

### 8. Seed the knowledge base

Once the `seed-data` function is deployed, seed your database:

```sh
curl -X POST https://<your-project-ref>.supabase.co/functions/v1/seed-data \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

- Use `"force": true` to clear and re-seed all data.
- This inserts 12 support guides, 87 FAQ Q&A pairs, and sample support tickets.

### 9. Start the development server

```sh
npm run dev
```

The app will be available at `http://localhost:8080`.

### 10. Verify the setup

Open the app and ask **"What is the Daylight DC-1?"** — the assistant should respond with accurate information and cite the source article.

## Developing Edge Functions Locally

You can serve edge functions locally for development and testing:

```sh
# Serve all functions locally
supabase functions serve

# Serve a specific function
supabase functions serve chat
```

This starts a local server (default `http://localhost:54321/functions/v1/<function-name>`). To test against it, temporarily update your `.env`:

```env
VITE_SUPABASE_URL=http://localhost:54321
```

### Useful Supabase CLI commands

```sh
# Check function deployment status
supabase functions list

# View edge function logs (production)
supabase functions logs chat

# Run database migrations
supabase db push

# Generate TypeScript types from your schema
supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Reset the remote database (caution: destructive)
supabase db reset --linked
```

## Project Structure

```
src/
├── components/        # UI components (ChatMessage, ChatInput, ChatSidebar, etc.)
├── hooks/             # Custom hooks (use-conversations, use-toast)
├── lib/               # Chat streaming logic and types
├── pages/             # Index (chat) and Analytics pages
└── integrations/      # Supabase client and auto-generated types

supabase/
├── config.toml        # Supabase project configuration
├── migrations/        # SQL migration files
└── functions/
    ├── chat/          # AI chat edge function with RAG
    └── seed-data/     # Knowledge base and ticket seeding
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `knowledge_base` | FAQ content and support guides with full-text search |
| `chat_interactions` | Logs of user queries and matched articles |
| `support_tickets` | Real and synthetic support tickets for analytics |

## How It Works

1. User sends a message
2. Client-side searches `knowledge_base` via `search_knowledge_base` RPC for source citations
3. Chat edge function also performs RAG search and injects matched articles into the system prompt
4. Gemini generates a response grounded in the knowledge base content
5. Response streams back to the client with source article links

---

## RAG (Retrieval-Augmented Generation)

The assistant uses **RAG** to ground answers in your support content instead of relying only on the model’s training. This reduces hallucinations and keeps answers aligned with Daylight’s docs and FAQs.

### Approach: Postgres full-text search (no embeddings)

This project uses **PostgreSQL full-text search** rather than vector embeddings. That keeps the stack simple (no embedding API or vector DB) and works well for FAQ/support text where keyword and phrase match is effective.

### Retrieval pipeline

1. **Indexing** — Each `knowledge_base` row has a `search_vector` (`tsvector`) updated by a trigger on insert/update. Weights:
   - **Title** → weight `A` (highest)
   - **Category** and **tags** → weight `B`
   - **Content** → weight `C`
2. **Query** — The user’s latest message is passed to the `search_knowledge_base(search_query, match_count)` RPC.
3. **Matching** — Postgres uses `websearch_to_tsquery('english', search_query)` so users can type natural questions; `ts_rank` orders by relevance.
4. **Top‑K** — By default the top **3** articles are returned (`match_count` is configurable in the edge function).
5. **Context injection** — Those articles are concatenated into a “RELEVANT KNOWLEDGE BASE ARTICLES” block and appended to the **system instruction** for Gemini.
6. **Generation** — The model is instructed to base answers on the provided articles and to cite them by title.

### Dual search (client + edge function)

- **Edge function** — Runs RAG inside the `chat` function so every reply is grounded in retrieved articles and interactions can be logged (e.g. `chat_interactions`, deflection).
- **Client** — Also calls `search_knowledge_base` so the UI can show **source citations** (links to the articles) next to the answer.

### Extending the knowledge base

- Add rows to `knowledge_base` (title, category, content, optional `source_url`, `tags`). The trigger keeps `search_vector` in sync.
- Re-run the `seed-data` edge function with `"force": true` to replace content, or insert/update rows directly for incremental updates.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL (e.g. `https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key (safe for client-side) |

**Edge function secrets** (set via `supabase secrets set`):

| Secret | Required | Description |
|--------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for Gemini 2.5 Flash |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by Supabase in edge functions; you do not set them yourself.

---

## Deployment

### Prerequisites

- Supabase project with migrations applied (`supabase db push`)
- Edge functions deployed (`supabase functions deploy`) and `GEMINI_API_KEY` set
- Knowledge base seeded (e.g. via `seed-data` function)

### Frontend (static build)

The app is a Vite SPA. Build for production:

```sh
npm run build
```

Output is in `dist/`. Deploy that folder to any static host.

#### Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. **Build command:** `npm run build`
3. **Output directory:** `dist`
4. **Environment variables:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the project settings.
5. Redeploy after any env change.

#### Netlify

1. Connect the repo in [Netlify](https://netlify.com).
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. In **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

#### Cloudflare Pages

1. Connect the repo in [Cloudflare Pages](https://pages.cloudflare.com).
2. **Build command:** `npm run build`
3. **Build output directory:** `dist`
4. Add the same env vars under **Settings → Environment variables** (Vite requires `VITE_` prefix for client exposure).

### Backend (Supabase)

- **Database** — Run `supabase db push` for the project you use in production.
- **Edge functions** — Run `supabase functions deploy` (or deploy per function). Ensure `GEMINI_API_KEY` is set in the same project.
- **Seed** — After first deploy, call the `seed-data` function once (with `force: true` if you want to reset and re-seed).

### Checklist

- [ ] `supabase db push` applied to production project
- [ ] `supabase secrets set GEMINI_API_KEY=...` for production
- [ ] `supabase functions deploy` (at least `chat` and `seed-data`)
- [ ] Knowledge base seeded via `seed-data`
- [ ] Frontend env vars set on the static host (`VITE_SUPABASE_*`)
- [ ] Build uses production Supabase URL (no localhost)

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| "GEMINI_API_KEY is not configured" | Set the secret: `supabase secrets set GEMINI_API_KEY=<your-key>` and redeploy the `chat` function. |
| No / wrong sources in answers | Confirm `knowledge_base` has rows and run `search_knowledge_base` in SQL or via the client; check that the query is in English or matches your content. |
| CORS or 401 on edge function | Ensure the request includes `Authorization: Bearer <anon-key>` and that the anon key is from the same project as the function. |
| Blank or broken UI after deploy | Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in the hosting platform (and that they start with `VITE_` so Vite embeds them in the client build). |
| Local dev: function not found | Run `supabase functions serve` and point `VITE_SUPABASE_URL` to `http://localhost:54321` when testing against local functions. |
