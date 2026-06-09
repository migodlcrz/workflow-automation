import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Bot, Calendar, Clock, FileText, Mail,
  Tag, User, Users, Zap, AlertCircle, Sheet
} from "lucide-react";
import { getTicketById } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, PriorityBadge } from "@/components/tickets/status-badge";
import { StatusUpdater } from "@/components/dashboard/status-updater";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const ticket = await getTicketById(id);
  return {
    title: ticket ? `${ticket.ticket_number} — ${ticket.subject}` : "Ticket Not Found",
  };
}

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  const ticket = await getTicketById(id);
  if (!ticket) notFound();

  const hasAI = !!ticket.ai_analyzed_at;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back + header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/support">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.ai_priority} />
            </div>
            <p className="font-mono text-sm text-muted-foreground">{ticket.ticket_number}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Update status:</span>
            <StatusUpdater ticketId={ticket.id} currentStatus={ticket.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              {ticket.affected_system && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Affected system:</span>
                  <Badge variant="outline">{ticket.affected_system}</Badge>
                </div>
              )}
              {ticket.attachment_url && (
                <div className="mt-3 text-sm">
                  <a
                    href={ticket.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    View attachment
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className={hasAI ? "border-primary/20" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bot className={`h-4 w-4 ${hasAI ? "text-primary" : "text-muted-foreground"}`} />
                <CardTitle className="text-sm">AI Triage Analysis</CardTitle>
                {hasAI && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {Math.round((ticket.ai_confidence_score ?? 0) * 100)}% confidence
                  </Badge>
                )}
              </div>
              {!hasAI && (
                <CardDescription>AI analysis pending or unavailable.</CardDescription>
              )}
            </CardHeader>
            {hasAI && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{ticket.ai_category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Suggested Team</p>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{ticket.ai_suggested_team}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Est. Resolution</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{ticket.ai_estimated_resolution}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">AI Priority</p>
                    <PriorityBadge priority={ticket.ai_priority} />
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Summary</p>
                  <p className="text-sm leading-relaxed">{ticket.ai_summary}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Root Cause</p>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm leading-relaxed">{ticket.ai_root_cause}</p>
                  </div>
                </div>

                {ticket.ai_analysis_raw?.reasoning && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">AI Reasoning</p>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {ticket.ai_analysis_raw.reasoning}
                    </p>
                  </div>
                )}

                {ticket.ai_tags && ticket.ai_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    {ticket.ai_tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Analyzed {new Date(ticket.ai_analyzed_at!).toLocaleString()}
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Submitter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{ticket.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${ticket.email}`} className="text-primary hover:underline truncate">
                  {ticket.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{ticket.department}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Urgency</span>
                <Badge variant="outline" className="capitalize">{ticket.urgency_level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={ticket.status} />
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              {ticket.sheets_synced_at && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sheet className="h-3.5 w-3.5" />
                  <span>Synced to Sheets</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
