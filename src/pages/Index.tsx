import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestionChips } from "@/components/SuggestionChips";
import { TypingIndicator } from "@/components/TypingIndicator";
import { streamChat, type Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";
import { Sun } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        <ChatHeader />

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
    </div>
  );
};

export default Index;
