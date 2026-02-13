export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-1">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
      <div className="bg-chat-assistant rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot [animation-delay:0.2s]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
