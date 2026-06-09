import { z } from "zod";

export const submitTicketSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be under 255 characters"),

  department: z.enum(
    [
      "IT",
      "HR",
      "Finance",
      "Operations",
      "Sales",
      "Marketing",
      "Legal",
      "Engineering",
      "Customer Support",
      "Other",
    ],
    { error: "Please select a department" }
  ),

  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be under 200 characters"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be under 5000 characters"),

  urgency_level: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .default("medium"),

  affected_system: z
    .string()
    .max(200, "Affected system must be under 200 characters")
    .optional()
    .or(z.literal("")),

  attachment_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type SubmitTicketInput = z.input<typeof submitTicketSchema>;

export const updateTicketStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
