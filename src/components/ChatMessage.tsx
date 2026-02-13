import { cn } from "@/lib/utils";
import type { Message } from "@/lib/chat";
import ReactMarkdown from "react-markdown";
import { Bot, User, BookOpen } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser ? "bg-chat-user" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-chat-user-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-secondary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-tr-md"
            : "bg-chat-assistant text-chat-assistant-foreground rounded-tl-md"
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:font-heading">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {message.articles && message.articles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <div className="text-xs font-semibold opacity-75 mb-2 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Sources
                </div>
                <div className="space-y-1">
                   {message.articles.map((article) => (
                     <div key={article.id} className="text-xs opacity-75">
                       • {article.source_url ? (
                         <a 
                           href={article.source_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="font-medium text-primary hover:underline"
                         >
                           {article.title}
                         </a>
                       ) : (
                         <span className="font-medium">{article.title}</span>
                       )}
                       {article.category && <span className="opacity-60"> ({article.category})</span>}
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
