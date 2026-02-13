import { Sun, Plus, MessageSquare, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ChatSidebar({ conversations, activeId, onSelect, onNew, onDelete }: ChatSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center">
            <Sun className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-sm text-sidebar-foreground">
            Daylight
          </span>
        </div>
        <Button
          onClick={onNew}
          variant="outline"
          size="sm"
          className="w-full mt-3 gap-2 text-xs font-body"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-heading text-[11px] uppercase tracking-wider">
            History
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.length === 0 && (
                <p className="px-3 py-6 text-xs text-muted-foreground text-center">
                  No conversations yet
                </p>
              )}
              {conversations.map((convo) => (
                <SidebarMenuItem key={convo.id}>
                  <SidebarMenuButton
                    isActive={convo.id === activeId}
                    onClick={() => onSelect(convo.id)}
                    className="group/item"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-xs">{convo.title}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {formatTime(convo.updatedAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(convo.id);
                      }}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <p className="text-[10px] text-muted-foreground text-center">
          Powered by Daylight AI
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
