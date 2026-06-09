"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { submitTicketSchema, updateTicketStatusSchema } from "@/lib/schemas/ticket";
import { triageTicket } from "@/services/ai/triage";
import { syncTicketToSheets } from "@/services/google-sheets/sync";
import type { SubmitTicketInput } from "@/lib/schemas/ticket";
import type { Ticket } from "@/types/ticket";

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Submit a new support ticket.
 *
 * Flow:
 * 1. Validate input with Zod
 * 2. Insert raw ticket into Supabase (status: open)
 * 3. Run Groq AI triage asynchronously
 * 4. Update ticket with AI metadata
 * 5. Sync to Google Sheets
 * 6. Return ticket_number for the success page
 */
export async function submitTicketAction(
  input: SubmitTicketInput
): Promise<ActionResult<{ ticket_number: string; ticket_id: string }>> {
  // ── 1. Validate ──────────────────────────────────────────────────────────
  const parsed = submitTicketSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { success: false, error: firstError.message };
  }

  const supabase = createServerClient();

  // ── 2. Insert raw ticket ─────────────────────────────────────────────────
  const { data: ticket, error: insertError } = await supabase
    .from("tickets")
    .insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      department: parsed.data.department,
      subject: parsed.data.subject,
      description: parsed.data.description,
      urgency_level: parsed.data.urgency_level,
      affected_system: parsed.data.affected_system || null,
      attachment_url: parsed.data.attachment_url || null,
      status: "open",
    })
    .select()
    .single();

  if (insertError || !ticket) {
    console.error("[submitTicket] Insert error:", insertError);
    return { success: false, error: "Failed to save your ticket. Please try again." };
  }

  const ticketRow = ticket as Ticket;

  // ── 3 + 4. AI triage (non-blocking — errors don't fail the submission) ───
  try {
    const analysis = await triageTicket({
      subject: ticketRow.subject,
      description: ticketRow.description,
      department: ticketRow.department,
      urgency_level: ticketRow.urgency_level,
      affected_system: ticketRow.affected_system,
    });

    await supabase
      .from("tickets")
      .update({
        ai_category: analysis.category,
        ai_priority: analysis.priority,
        ai_summary: analysis.summary,
        ai_suggested_team: analysis.suggested_team,
        ai_confidence_score: analysis.confidence_score,
        ai_tags: analysis.tags,
        ai_estimated_resolution: analysis.estimated_resolution,
        ai_root_cause: analysis.root_cause,
        ai_analysis_raw: analysis,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq("id", ticketRow.id);

    // ── 5. Google Sheets sync ────────────────────────────────────────────────
    const { data: updatedTicket } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketRow.id)
      .single();

    if (updatedTicket) {
      try {
        await syncTicketToSheets(updatedTicket as Ticket);
        await supabase
          .from("tickets")
          .update({ sheets_synced_at: new Date().toISOString() })
          .eq("id", ticketRow.id);
      } catch (sheetsErr) {
        console.error("[submitTicket] Google Sheets sync error:", sheetsErr);
      }
    }
  } catch (aiErr) {
    console.error("[submitTicket] AI triage error:", aiErr);
    // Ticket is saved; AI failure is non-fatal
  }

  revalidatePath("/support");
  revalidatePath("/support/analytics");

  return {
    success: true,
    data: {
      ticket_number: ticketRow.ticket_number,
      ticket_id: ticketRow.id,
    },
  };
}

/**
 * Update a ticket's status from the support dashboard.
 */
export async function updateTicketStatusAction(
  id: string,
  status: Ticket["status"]
): Promise<ActionResult> {
  const parsed = updateTicketStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("tickets")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) {
    return { success: false, error: "Failed to update ticket status." };
  }

  revalidatePath("/support");
  revalidatePath(`/support/tickets/${id}`);

  // Sync updated status to Google Sheets (best-effort)
  try {
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();
    if (ticket) {
      await syncTicketToSheets(ticket as Ticket);
      await supabase
        .from("tickets")
        .update({ sheets_synced_at: new Date().toISOString() })
        .eq("id", id);
    }
  } catch {
    // Non-fatal
  }

  return { success: true };
}
