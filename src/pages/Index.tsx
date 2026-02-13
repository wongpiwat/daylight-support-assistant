import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChips } from "@/components/SuggestionChips";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatSidebar } from "@/components/ChatSidebar";
import { streamChat, type Message, type Article } from "@/lib/chat";
import { useConversations } from "@/hooks/use-conversations";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Sun } from "lucide-react";

const Index = () => {
  const {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateMessages,
    deleteConversation,
    selectConversation,
    startNew,
  } = useConversations();

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async (input: string) => {
    let currentId = activeId;
    let currentMessages = messages;

    if (!currentId) {
      currentId = createConversation();
      currentMessages = [];
    }

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...currentMessages, userMsg];
    updateMessages(currentId, newMessages);
    setIsLoading(true);

    let assistantSoFar = "";
    let currentArticles: Article[] = [];

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const updated = [
        ...newMessages,
        { role: "assistant" as const, content: assistantSoFar, articles: currentArticles },
      ];
      updateMessages(currentId!, updated);
    };

    try {
      await streamChat({
        messages: newMessages,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (error) => {
          setIsLoading(false);
          toast({ title: "Error", description: error, variant: "destructive" });
        },
        onArticles: (articles) => {
          currentArticles = articles;
          const updated = [
            ...newMessages,
            { role: "assistant" as const, content: assistantSoFar, articles },
          ];
          updateMessages(currentId!, updated);
        },
      });
    } catch {
      setIsLoading(false);
      toast({
        title: "Connection error",
        description: "Could not reach the assistant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={startNew}
          onDelete={deleteConversation}
        />

        <main className="flex-1 flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="gradient-warm px-6 py-5 flex items-center gap-3 shadow-warm">
              <SidebarTrigger className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" />
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                <Sun className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-semibold text-primary-foreground">
                  Daylight Support
                </h1>
                <p className="text-sm text-primary-foreground/75">
                  AI-powered assistant · Always here to help
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {showWelcome && (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl gradient-warm shadow-warm flex items-center justify-center">
                    <Sun className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
                      Welcome to Daylight Support
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-md font-body">
                      I can help with device setup, troubleshooting, Sol:OS features,
                      accessories, and more. What can I help you with?
                    </p>
                  </div>
                  <SuggestionChips onSelect={send} disabled={isLoading} />
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
            </div>

            {!showWelcome && (
              <div className="px-6 pb-2">
                <SuggestionChips onSelect={send} disabled={isLoading} />
              </div>
            )}

            <ChatInput onSend={send} disabled={isLoading} />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
