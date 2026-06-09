import { createServerClient } from "./server";
import type { Ticket, TicketFilters, TicketStats } from "@/types/ticket";

export async function getTickets(filters?: TicketFilters): Promise<Ticket[]> {
  const supabase = createServerClient();
  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.department) {
    query = query.eq("department", filters.department);
  }
  if (filters?.priority && filters.priority !== "all") {
    query = query.eq("ai_priority", filters.priority);
  }
  if (filters?.search) {
    query = query.or(
      `subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`
    );
  }
  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch tickets: ${error.message}`);
  return data as Ticket[];
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Ticket;
}

export async function getTicketByNumber(ticketNumber: string): Promise<Ticket | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("ticket_number", ticketNumber)
    .single();

  if (error) return null;
  return data as Ticket;
}

export async function getTicketStats(): Promise<TicketStats> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("tickets").select("status, ai_priority, ai_confidence_score, ai_analyzed_at");

  if (error) throw new Error(`Failed to fetch ticket stats: ${error.message}`);

  const tickets = data ?? [];
  const analyzed = tickets.filter((t) => t.ai_analyzed_at);
  const avgConf = analyzed.length
    ? analyzed.reduce((sum, t) => sum + (t.ai_confidence_score ?? 0), 0) / analyzed.length
    : 0;

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    high_priority: tickets.filter((t) => t.ai_priority === "high" || t.ai_priority === "critical").length,
    ai_analyzed: analyzed.length,
    avg_confidence: Math.round(avgConf * 100),
  };
}

export async function getUniqueDepartments(): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("tickets").select("department");
  const departments = [...new Set((data ?? []).map((t) => t.department))];
  return departments.sort();
}
