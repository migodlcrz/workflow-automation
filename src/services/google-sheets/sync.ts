/**
 * Google Sheets Sync Service
 *
 * Isolated from business logic — receives a fully-hydrated Ticket
 * and appends or updates a row in the configured spreadsheet.
 */

import { google } from "googleapis";
import type { Ticket } from "@/types/ticket";

function getAuthClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME ?? "Tickets";

const HEADERS = [
  "Ticket Number",
  "Created At",
  "Full Name",
  "Email",
  "Department",
  "Subject",
  "Description",
  "Urgency Level",
  "Affected System",
  "Status",
  "AI Category",
  "AI Priority",
  "AI Summary",
  "AI Suggested Team",
  "AI Confidence Score",
  "AI Tags",
  "AI Estimated Resolution",
  "AI Root Cause",
  "AI Analyzed At",
  "Ticket ID",
];

function ticketToRow(ticket: Ticket): string[] {
  return [
    ticket.ticket_number,
    ticket.created_at,
    ticket.full_name,
    ticket.email,
    ticket.department,
    ticket.subject,
    ticket.description,
    ticket.urgency_level,
    ticket.affected_system ?? "",
    ticket.status,
    ticket.ai_category ?? "",
    ticket.ai_priority ?? "",
    ticket.ai_summary ?? "",
    ticket.ai_suggested_team ?? "",
    ticket.ai_confidence_score != null ? String(Math.round(ticket.ai_confidence_score * 100)) + "%" : "",
    (ticket.ai_tags ?? []).join(", "),
    ticket.ai_estimated_resolution ?? "",
    ticket.ai_root_cause ?? "",
    ticket.ai_analyzed_at ?? "",
    ticket.id,
  ];
}

async function ensureHeaders(sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) {
  const range = `${TAB_NAME}!A1:T1`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const firstRow = res.data.values?.[0];

  if (!firstRow || firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function syncTicketToSheets(ticket: Ticket): Promise<void> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  await ensureHeaders(sheets, SPREADSHEET_ID);

  // Check if ticket already exists (search by ticket_number in column A)
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB_NAME}!A:A`,
  });

  const rows = existing.data.values ?? [];
  const existingRowIndex = rows.findIndex((row) => row[0] === ticket.ticket_number);

  const rowData = ticketToRow(ticket);

  if (existingRowIndex > 0) {
    // Update existing row (1-indexed, skip header = existingRowIndex + 1)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A${existingRowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [rowData] },
    });
  } else {
    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [rowData] },
    });
  }
}
