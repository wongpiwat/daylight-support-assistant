# Daylight Support Assistant

An AI-powered customer support chatbot for [Daylight Computer](https://daylightcomputer.com), built with React, TypeScript, and Lovable Cloud.

The assistant uses Retrieval-Augmented Generation (RAG) to answer customer questions about the DC-1 computer, Sol:OS, accessories, orders, and more — drawing from a curated knowledge base of support guides and FAQ content.

## Features

- **AI Chat** — Streaming responses powered by Gemini via Lovable AI Gateway
- **RAG Pipeline** — Postgres full-text search retrieves relevant knowledge base articles to ground responses
- **87 FAQ Q&A Pairs** — Covering Order, Device, Software, Company, Health, Work With Us, and more
- **12 Support Guides** — Detailed guides from support.daylightcomputer.com
- **Source Citations** — Answers link back to source articles
- **Conversation History** — Persisted locally with sidebar navigation
- **Analytics Dashboard** — Track chat interactions, ticket volume, and deflection rates
- **Suggestion Chips** — Quick-start prompts for common questions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase) — Postgres database, Edge Functions
- **AI**: Google Gemini 3 Flash via Lovable AI Gateway
- **Search**: Postgres `tsvector` full-text search (no external embeddings needed)

## Project Setup

### 1. Clone the repository

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start the development server

```sh
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Seed the knowledge base

The knowledge base needs to be seeded with FAQ and guide content before the chatbot can answer questions accurately.

Call the seed endpoint (via the app or directly):

```sh
curl -X POST <SUPABASE_URL>/functions/v1/seed-data \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

- Use `"force": true` to clear and re-seed all data.
- This inserts 12 support guides, 87 FAQ Q&A pairs, and sample support tickets.

### 5. Verify the setup

Open the app and ask a question like **"Can I pay in BTC?"** — the assistant should respond with accurate information from the knowledge base and cite the source article.

## Project Structure

```
src/
├── components/        # UI components (ChatMessage, ChatInput, ChatSidebar, etc.)
├── hooks/             # Custom hooks (use-conversations, use-toast)
├── lib/               # Chat streaming logic and types
├── pages/             # Index (chat) and Analytics pages
└── integrations/      # Auto-generated Supabase client and types

supabase/
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

Open [Lovable](https://lovable.dev) and click **Share → Publish**.

Published URL: [daylight-support-assistant.lovable.app](https://daylight-support-assistant.lovable.app)

## Custom Domain

Navigate to **Project → Settings → Domains → Connect Domain**.

See: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
