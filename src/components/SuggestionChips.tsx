import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Wifi,
  AppWindow,
  Settings,
  HelpCircle,
  Monitor,
  Info,
  FileText,
  Package,
  Zap,
  Download,
  Sun,
  Shield,
  Smartphone,
} from "lucide-react";

const suggestions = [
  { label: "What is Daylight DC-1?", icon: Info },
  { label: "What is the spec of DC-1?", icon: FileText },
  { label: "How do I reset my DC-1?", icon: RotateCcw },
  { label: "Set up Ethernet connection", icon: Wifi },
  { label: "App compatibility", icon: AppWindow },
  { label: "Sol:OS settings", icon: Settings },
  { label: "Outdoor accessories", icon: HelpCircle },
  { label: "Display troubleshooting", icon: Monitor },
  { label: "Installation and mounting", icon: Package },
  { label: "Power and battery", icon: Zap },
  { label: "Software updates", icon: Download },
  { label: "Brightness and outdoor visibility", icon: Sun },
  { label: "Warranty and support", icon: Shield },
  { label: "Pair with phone or remote", icon: Smartphone },
];

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 pt-2">
      {suggestions.map((s) => (
        <Button
          key={s.label}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(s.label)}
          className="rounded-full text-xs font-body gap-1.5 border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <s.icon className="w-3.5 h-3.5" />
          {s.label}
        </Button>
      ))}
    </div>
  );
}
