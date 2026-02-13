# Daylight Support Assistant

An AI-powered customer support chatbot for [Daylight Computer](https://daylightcomputer.com), built with React, TypeScript, and Supabase.

The assistant uses Retrieval-Augmented Generation (RAG) to answer customer questions about the DC-1 computer, Sol:OS, accessories, orders, and more — drawing from a curated knowledge base of support guides and FAQ content.

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

## Local Setup (Without Lovable)

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

The app will be available at `http://localhost:5173`.

### 10. Verify the setup

Open the app and ask **"Can I pay in BTC?"** — the assistant should respond with accurate information and cite the source article.

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

## Deployment

### Via Lovable

Open [Lovable](https://lovable.dev) and click **Share → Publish**.

### Via Supabase CLI (self-hosted)

1. Deploy edge functions: `supabase functions deploy`
2. Push database migrations: `supabase db push`
3. Build the frontend: `npm run build`
4. Host the `dist/` folder on any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.)

## Custom Domain

If using Lovable: Navigate to **Project → Settings → Domains → Connect Domain**.

See: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
