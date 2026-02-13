import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Bot, Users, CheckCircle, AlertTriangle, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TicketStats {
  total: number;
  resolvedByAi: number;
  escalated: number;
  open: number;
  closed: number;
  deflectionRate: number;
  avgSatisfaction: number;
  byCategory: { name: string; value: number }[];
  byPriority: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
}

interface InteractionStats {
  total: number;
  withArticles: number;
  deflectionRate: number;
}

const COLORS = [
  "hsl(36, 90%, 50%)",
  "hsl(28, 85%, 55%)",
  "hsl(45, 80%, 45%)",
  "hsl(20, 70%, 50%)",
  "hsl(36, 60%, 65%)",
  "hsl(15, 75%, 45%)",
  "hsl(40, 90%, 55%)",
  "hsl(30, 50%, 40%)",
];

export default function Analytics() {
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [interactionStats, setInteractionStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [kbCount, setKbCount] = useState(0);

  const fetchStats = async () => {
    setLoading(true);

    const [ticketsRes, interactionsRes, kbRes] = await Promise.all([
      supabase.from("support_tickets").select("*"),
      supabase.from("chat_interactions").select("*"),
      supabase.from("knowledge_base").select("id"),
    ]);

    setKbCount(kbRes.data?.length ?? 0);

    const tickets = ticketsRes.data ?? [];
    const interactions = interactionsRes.data ?? [];

    if (tickets.length > 0) {
      const resolvedByAi = tickets.filter((t) => t.status === "resolved_by_ai").length;
      const escalated = tickets.filter((t) => t.status === "escalated").length;
      const open = tickets.filter((t) => t.status === "open").length;
      const closed = tickets.filter((t) => t.status === "closed").length;
      const satisfied = tickets.filter((t) => t.user_satisfied === true).length;
      const rated = tickets.filter((t) => t.user_satisfied !== null).length;

      const catCounts: Record<string, number> = {};
      const priCounts: Record<string, number> = {};
      tickets.forEach((t) => {
        catCounts[t.category || "Unknown"] = (catCounts[t.category || "Unknown"] || 0) + 1;
        priCounts[t.priority || "medium"] = (priCounts[t.priority || "medium"] || 0) + 1;
      });

      setTicketStats({
        total: tickets.length,
        resolvedByAi,
        escalated,
        open,
        closed,
        deflectionRate: tickets.length > 0 ? (resolvedByAi / tickets.length) * 100 : 0,
        avgSatisfaction: rated > 0 ? (satisfied / rated) * 100 : 0,
        byCategory: Object.entries(catCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        byPriority: Object.entries(priCounts).map(([name, value]) => ({ name, value })),
        byStatus: [
          { name: "AI Resolved", value: resolvedByAi },
          { name: "Escalated", value: escalated },
          { name: "Open", value: open },
          { name: "Closed", value: closed },
        ],
      });
    }

    if (interactions.length > 0) {
      const withArticles = interactions.filter((i) => i.was_deflected).length;
      setInteractionStats({
        total: interactions.length,
        withArticles,
        deflectionRate: (withArticles / interactions.length) * 100,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      const data = await resp.json();
      if (data.success) {
        await fetchStats();
      }
    } catch (e) {
      console.error("Seed error:", e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Chat
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Support Analytics
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                AI deflection metrics & ticket insights
              </p>
            </div>
          </div>
          <Button
            onClick={handleSeed}
            disabled={seeding}
            variant="outline"
            className="gap-2"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            {seeding ? "Seeding..." : "Seed Demo Data"}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !ticketStats ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-heading font-semibold mb-2">No Data Yet</h2>
            <p className="text-muted-foreground mb-4 font-body">
              Click "Seed Demo Data" to populate with 10 real guides and 510 tickets.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold">{ticketStats.deflectionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground font-body">AI Deflection Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold">{ticketStats.total}</p>
                      <p className="text-xs text-muted-foreground font-body">Total Tickets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Bot className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold">{ticketStats.resolvedByAi}</p>
                      <p className="text-xs text-muted-foreground font-body">AI Resolved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold">{ticketStats.avgSatisfaction.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground font-body">Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Knowledge Base */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-heading font-bold">{kbCount}</p>
                      <p className="text-xs text-muted-foreground font-body">Knowledge Base Articles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {interactionStats && (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                          <Bot className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="text-2xl font-heading font-bold">{interactionStats.total}</p>
                          <p className="text-xs text-muted-foreground font-body">Chat Interactions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-2xl font-heading font-bold">{interactionStats.deflectionRate.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground font-body">RAG Hit Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading">Resolution Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={ticketStats.byStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {ticketStats.byStatus.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading">Tickets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={ticketStats.byCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(36, 20%, 90%)" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(36, 90%, 50%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
