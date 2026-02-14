import { Sun } from "lucide-react";

export function ChatHeader() {
  return (
    <div className="gradient-warm px-6 py-5 flex items-center gap-3 shadow-warm">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
        <Sun className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-lg font-heading font-semibold text-primary-foreground">
          Daylight Support
        </h1>
        <p className="text-base text-primary-foreground/75">
          AI-powered assistant · Always here to help
        </p>
      </div>
    </div>
  );
}
