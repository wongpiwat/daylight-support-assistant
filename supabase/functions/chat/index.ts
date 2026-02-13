import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.14.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Daylight Support Assistant — a friendly, knowledgeable AI helper for Daylight Computer customers.

Your role is to help customers with:
- Device setup, reset, and configuration (DC-1)
- Sol:OS features and settings
- Ethernet connections and tested accessories
- App installation and compatibility
- Troubleshooting common issues
- Accessory recommendations for specific use cases (outdoor use, connectivity, etc.)

Guidelines:
- Be warm, concise, and helpful
- When you know the answer, provide clear step-by-step instructions
- Suggest related guides or accessories when relevant
- If you're unsure about something, say so honestly and recommend contacting the Daylight support team
- Format responses with clear headings and bullet points when listing steps
- Keep answers focused — don't overwhelm with information
- IMPORTANT: When you use information from the provided knowledge base articles, cite the article title naturally (e.g. "According to our guide on [Title]...")

Key Daylight products and terms:
- DC-1: Daylight's flagship computer with a reflective display
- Sol:OS: Daylight's custom operating system
- LivePaper display: The unique reflective screen technology
- Daylight accessories: Ethernet adapters, stands, cases tested and recommended by Daylight

Always maintain a positive, solution-oriented tone that reflects the Daylight brand.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversation_id } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // RAG: Extract user's latest query and search knowledge base
    const latestUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    let ragContext = "";
    let matchedArticles: Array<{ id: string; title: string; category: string }> = [];

    if (latestUserMsg) {
      const { data: articles } = await supabase.rpc("search_knowledge_base", {
        search_query: latestUserMsg.content,
        match_count: 3,
      });

      if (articles && articles.length > 0) {
        matchedArticles = articles.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category,
        }));
        ragContext = "\n\n---\nRELEVANT KNOWLEDGE BASE ARTICLES:\n\n" +
          articles.map((a: any, i: number) =>
            `[Article ${i + 1}: "${a.title}" | Category: ${a.category}]\n${a.content}`
          ).join("\n\n") +
          "\n---\nUse the above articles to inform your answer. If the articles are relevant, base your response on them. If not, answer from your general knowledge.\n";
      }

      // Log the interaction
      try {
        await supabase.from("chat_interactions").insert({
          conversation_id: conversation_id || "anonymous",
          user_query: latestUserMsg.content,
          matched_articles: matchedArticles.map((a) => a.id),
          was_deflected: matchedArticles.length > 0,
        });
      } catch (e) {
        console.error("Failed to log interaction:", e);
      }
    }

    const systemInstruction = SYSTEM_PROMPT + ragContext;

    // Convert messages to Gemini format
    const geminiContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: geminiContents,
      config: {
        systemInstruction,
      },
    });

    // Convert Gemini stream to SSE format compatible with existing frontend
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
              const sseData = JSON.stringify({
                choices: [{ delta: { content: text } }],
              });
              controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          console.error("Stream error:", e);
          const errorMsg = e instanceof Error ? e.message : "Stream error";
          if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Rate limit exceeded" })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
