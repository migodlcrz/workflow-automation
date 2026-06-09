import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight, Bot, Clock, Tag, Users } from "lucide-react";
import { getTicketByNumber } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge, StatusBadge } from "@/components/tickets/status-badge";

export const metadata: Metadata = { title: "Ticket Submitted" };

interface Props {
  searchParams: Promise<{ ticket?: string; id?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const ticketNumber = params.ticket;

  if (!ticketNumber) notFound();

  const ticket = await getTicketByNumber(ticketNumber);
  if (!ticket) notFound();

  const hasAI = !!ticket.ai_analyzed_at;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      {/* Success header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Ticket Submitted Successfully</h1>
        <p className="mt-2 text-muted-foreground">
          Your support request has been received and is being processed.
        </p>
        <div className="mt-4 rounded-lg border bg-muted/40 px-6 py-3">
          <p className="text-xs text-muted-foreground">Ticket Number</p>
          <p className="text-xl font-mono font-bold tracking-wider">{ticket.ticket_number}</p>
        </div>
      </div>

      {/* Ticket summary */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ticket Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Submitted by</p>
              <p className="font-medium">{ticket.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{ticket.department}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={ticket.status} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Urgency</p>
              <Badge variant="outline" className="capitalize">{ticket.urgency_level}</Badge>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Subject</p>
            <p className="font-medium">{ticket.subject}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {hasAI && (
        <Card className="mb-4 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">AI Triage Results</CardTitle>
              <Badge variant="secondary" className="text-xs ml-auto">
                {Math.round((ticket.ai_confidence_score ?? 0) * 100)}% confidence
              </Badge>
            </div>
            <CardDescription>Your ticket has been automatically analyzed and routed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium">{ticket.ai_category}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Team</p>
                  <p className="font-medium">{ticket.ai_suggested_team}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Est. Resolution</p>
                  <p className="font-medium">{ticket.ai_estimated_resolution}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">AI Priority</p>
                <PriorityBadge priority={ticket.ai_priority} />
              </div>
            </div>
            {ticket.ai_summary && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Summary</p>
                  <p className="text-sm leading-relaxed">{ticket.ai_summary}</p>
                </div>
              </>
            )}
            {ticket.ai_tags && ticket.ai_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ticket.ai_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!hasAI && (
        <Card className="mb-4 border-muted">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
            <Bot className="h-4 w-4 animate-pulse text-primary" />
            AI triage is in progress. Refresh this page in a moment to see results.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/submit">
            Submit Another Ticket
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/support">
            Support Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
