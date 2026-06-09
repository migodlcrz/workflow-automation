import { Badge } from "@/components/ui/badge";
import type { TicketStatus, AIPriority } from "@/types/ticket";

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "default" },
  in_progress: { label: "In Progress", variant: "secondary" },
  resolved: { label: "Resolved", variant: "outline" },
  closed: { label: "Closed", variant: "outline" },
};

const priorityConfig: Record<AIPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-green-100 text-green-800 border-green-200" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 border-orange-200" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800 border-red-200" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status] ?? statusConfig.open;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: AIPriority | null }) {
  if (!priority) return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
