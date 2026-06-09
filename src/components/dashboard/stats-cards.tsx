import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Clock, CheckCircle2, AlertTriangle, Bot, TrendingUp } from "lucide-react";
import type { TicketStats } from "@/types/ticket";

interface Props {
  stats: TicketStats;
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Ticket,
      description: "All time",
    },
    {
      title: "Open",
      value: stats.open,
      icon: Clock,
      description: "Awaiting action",
      highlight: stats.open > 0,
    },
    {
      title: "In Progress",
      value: stats.in_progress,
      icon: TrendingUp,
      description: "Being worked on",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      description: "Completed",
    },
    {
      title: "High Priority",
      value: stats.high_priority,
      icon: AlertTriangle,
      description: "High + critical",
      highlight: stats.high_priority > 0,
      highlightColor: "text-orange-500",
    },
    {
      title: "AI Analyzed",
      value: stats.ai_analyzed,
      icon: Bot,
      description: `${stats.avg_confidence}% avg confidence`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon
              className={`h-4 w-4 ${card.highlight ? (card.highlightColor ?? "text-primary") : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.highlight ? (card.highlightColor ?? "text-primary") : ""}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
