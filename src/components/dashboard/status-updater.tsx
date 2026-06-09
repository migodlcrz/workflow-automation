"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTicketStatusAction } from "@/app/actions/tickets";
import type { TicketStatus } from "@/types/ticket";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

interface Props {
  ticketId: string;
  currentStatus: TicketStatus;
}

export function StatusUpdater({ ticketId, currentStatus }: Props) {
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(value: TicketStatus) {
    if (value === status) return;
    setLoading(true);
    const result = await updateTicketStatusAction(ticketId, value);
    if (result.success) {
      setStatus(value);
      toast.success(`Status updated to "${STATUS_OPTIONS.find((s) => s.value === value)?.label}"`);
    } else {
      toast.error(result.error ?? "Failed to update status.");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      <Select value={status} onValueChange={(v) => handleChange(v as TicketStatus)} disabled={loading}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
