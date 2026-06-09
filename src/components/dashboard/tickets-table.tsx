import Link from "next/link";
import { ExternalLink, Bot } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/tickets/status-badge";
import type { Ticket } from "@/types/ticket";

interface Props {
  tickets: Ticket[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketsTable({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No tickets found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Ticket #</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="w-[120px]">Submitter</TableHead>
            <TableHead className="w-[110px]">Department</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">AI Priority</TableHead>
            <TableHead className="w-[140px]">AI Category</TableHead>
            <TableHead className="w-[100px]">Submitted</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="group">
              <TableCell className="font-mono text-xs font-medium">
                {ticket.ticket_number}
              </TableCell>
              <TableCell className="max-w-[240px]">
                <p className="truncate text-sm font-medium">{ticket.subject}</p>
                {ticket.ai_analyzed_at && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <Bot className="h-3 w-3 text-primary/60" />
                    <p className="truncate text-xs text-muted-foreground">
                      {ticket.ai_summary?.slice(0, 60)}...
                    </p>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm">{ticket.full_name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">{ticket.department}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={ticket.ai_priority} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {ticket.ai_category ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(ticket.created_at)}
              </TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                  <Link href={`/support/tickets/${ticket.id}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="sr-only">View ticket</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
