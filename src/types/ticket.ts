export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type AIPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
  id: string;
  ticket_number: string;

  full_name: string;
  email: string;
  department: string;

  subject: string;
  description: string;
  urgency_level: UrgencyLevel;
  affected_system: string | null;
  attachment_url: string | null;

  status: TicketStatus;

  ai_category: string | null;
  ai_priority: AIPriority | null;
  ai_summary: string | null;
  ai_suggested_team: string | null;
  ai_confidence_score: number | null;
  ai_tags: string[] | null;
  ai_estimated_resolution: string | null;
  ai_root_cause: string | null;
  ai_analysis_raw: AIAnalysisRaw | null;
  ai_analyzed_at: string | null;

  sheets_synced_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface AIAnalysisRaw {
  category: string;
  priority: AIPriority;
  summary: string;
  suggested_team: string;
  confidence_score: number;
  tags: string[];
  estimated_resolution: string;
  root_cause: string;
  reasoning: string;
}

export interface TicketFilters {
  status?: TicketStatus | "all";
  department?: string;
  priority?: AIPriority | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  high_priority: number;
  ai_analyzed: number;
  avg_confidence: number;
}
