export type Article = {
  id: string;
  title: string;
  category: string;
  source_url?: string;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  articles?: Article[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  onArticles,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  onArticles?: (articles: Article[]) => void;
}) {
  // Get latest user message for article search
  const latestUserMsg = messages[messages.length - 1]?.content;
  let articlesToShow: Article[] = [];

  // Try to fetch articles from knowledge base before calling chat
  if (latestUserMsg) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      );
      const { data: articles } = await supabase.rpc("search_knowledge_base", {
        search_query: latestUserMsg,
        match_count: 3,
      });
      if (articles && articles.length > 0) {
         articlesToShow = articles.map((a: any) => ({
           id: a.id,
           title: a.title,
           category: a.category,
           source_url: a.source_url,
         }));
         onArticles?.(articlesToShow);
       }
    } catch (e) {
      // Article search failed, that's ok
    }
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, conversation_id: crypto.randomUUID() }),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) {
      onError("I'm getting too many requests right now. Please try again in a moment.");
      return;
    }
    if (resp.status === 402) {
      onError("Service is temporarily unavailable. Please try again later.");
      return;
    }
    onError("Something went wrong. Please try again.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") {
        // Parse metadata lines like :articles:...
        if (line.startsWith(":articles:")) {
          try {
            const articlesJson = line.slice(9);
            const articles = JSON.parse(articlesJson) as Article[];
            onArticles?.(articles);
          } catch (e) {
            console.error("Failed to parse articles", e);
          }
        }
        continue;
      }
      if (!line.startsWith("data: ")) continue;

       const json = line.slice(6).trim();
       if (json === "[DONE]") { streamDone = true; break; }

       try {
         const parsed = JSON.parse(json);
         // Check for special __articles field
         if (parsed.__articles) {
           onArticles?.(parsed.__articles);
         }
         const content = parsed.choices?.[0]?.delta?.content;
         if (content) onDelta(content);
       } catch {
         buffer = line + "\n" + buffer;
         break;
       }
    }
  }

  // flush
  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {}
    }
  }

  onDone();
}
