import type { Metadata } from "next";
import { getTickets, getTicketStats } from "@/lib/supabase/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Bot, BarChart3, TrendingUp, Tag } from "lucide-react";
import type { Ticket, AIPriority, TicketStatus } from "@/types/ticket";

export const metadata: Metadata = { title: "Ticket Analytics" };
export const dynamic = "force-dynamic";

function countBy<T extends string>(items: T[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function topN(counts: Record<string, number>, n: number) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

const PRIORITY_COLORS: Record<AIPriority, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-blue-500",
  in_progress: "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-400",
};

export default async function AnalyticsPage() {
  const [tickets, stats] = await Promise.all([getTickets(), getTicketStats()]);

  const analyzedTickets = tickets.filter((t) => t.ai_analyzed_at);

  const priorityCounts = countBy(
    analyzedTickets.map((t) => t.ai_priority ?? "unknown").filter(Boolean)
  );
  const statusCounts = countBy(tickets.map((t) => t.status));
  const categoryCounts = countBy(
    analyzedTickets.map((t) => t.ai_category ?? "Unknown")
  );
  const teamCounts = countBy(
    analyzedTickets.map((t) => t.ai_suggested_team ?? "Unknown")
  );
  const departmentCounts = countBy(tickets.map((t) => t.department));

  const allTags = analyzedTickets.flatMap((t) => t.ai_tags ?? []);
  const tagCounts = countBy(allTags);

  const topCategories = topN(categoryCounts, 6);
  const topTeams = topN(teamCounts, 6);
  const topDepartments = topN(departmentCounts, 6);
  const topTags = topN(tagCounts, 12);

  const sheetsSyncedCount = tickets.filter((t) => t.sheets_synced_at).length;
  const syncRate = tickets.length > 0 ? Math.round((sheetsSyncedCount / tickets.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Ticket Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Aggregate insights across {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}.
          {analyzedTickets.length > 0 && ` ${analyzedTickets.length} AI-analyzed.`}
        </p>
      </div>

      <div className="space-y-6">
        <StatsCards stats={stats} />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Priority Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                AI Priority Distribution
              </CardTitle>
              <CardDescription>Based on {analyzedTickets.length} AI-analyzed tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["critical", "high", "medium", "low"] as AIPriority[]).map((priority) => {
                const count = priorityCounts[priority] ?? 0;
                const pct = analyzedTickets.length > 0
                  ? Math.round((count / analyzedTickets.length) * 100)
                  : 0;
                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[priority]}`} />
                        <span className="capitalize">{priority}</span>
                      </div>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Status Distribution
              </CardTitle>
              <CardDescription>Across all {tickets.length} tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(["open", "in_progress", "resolved", "closed"] as TicketStatus[]).map((status) => {
                const count = statusCounts[status] ?? 0;
                const pct = tickets.length > 0
                  ? Math.round((count / tickets.length) * 100)
                  : 0;
                const labels: Record<TicketStatus, string> = {
                  open: "Open",
                  in_progress: "In Progress",
                  resolved: "Resolved",
                  closed: "Closed",
                };
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                        <span>{labels[status]}</span>
                      </div>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                Top AI Categories
              </CardTitle>
              <CardDescription>AI-classified issue types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No AI data yet.</p>
              ) : topCategories.map(([category, count]) => {
                const pct = analyzedTickets.length > 0
                  ? Math.round((count / analyzedTickets.length) * 100)
                  : 0;
                return (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="truncate">{category}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Suggested Teams */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Top Routed Teams</CardTitle>
              <CardDescription>Where AI directed tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topTeams.length === 0 ? (
                <p className="text-sm text-muted-foreground">No AI data yet.</p>
              ) : topTeams.map(([team, count]) => {
                const pct = analyzedTickets.length > 0
                  ? Math.round((count / analyzedTickets.length) * 100)
                  : 0;
                return (
                  <div key={team} className="flex items-center justify-between text-sm">
                    <span className="truncate">{team}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tickets by Department</CardTitle>
              <CardDescription>Submission volume per department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topDepartments.map(([dept, count]) => {
                const pct = tickets.length > 0
                  ? Math.round((count / tickets.length) * 100)
                  : 0;
                return (
                  <div key={dept} className="flex items-center justify-between text-sm">
                    <span>{dept}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Integration Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Integration Health</CardTitle>
              <CardDescription>Pipeline sync status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>AI Triage Coverage</span>
                  <span className="text-muted-foreground">
                    {analyzedTickets.length}/{tickets.length} ({stats.total > 0 ? Math.round((stats.ai_analyzed / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <Progress
                  value={stats.total > 0 ? (stats.ai_analyzed / stats.total) * 100 : 0}
                  className="h-1.5"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Google Sheets Sync</span>
                  <span className="text-muted-foreground">{sheetsSyncedCount}/{tickets.length} ({syncRate}%)</span>
                </div>
                <Progress value={syncRate} className="h-1.5" />
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg AI Confidence</span>
                <span className="font-medium">{stats.avg_confidence}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tags Cloud */}
        {topTags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                AI-Generated Tags
              </CardTitle>
              <CardDescription>Most common tags across analyzed tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <span className="ml-1 text-muted-foreground">×{count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
