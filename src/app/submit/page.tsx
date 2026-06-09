import type { Metadata } from "next";
import { TicketForm } from "@/components/tickets/ticket-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Submit a Ticket",
  description: "Submit a support ticket and get AI-powered triage within seconds.",
};

export default function SubmitPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">Submit a Support Ticket</h1>
          <Badge variant="secondary" className="text-xs">AI Triage Enabled</Badge>
        </div>
        <p className="text-muted-foreground">
          Fill out the form below. Your ticket will be automatically categorized, prioritized, and routed
          to the right team by our AI triage system.
        </p>
      </div>

      {/* Trust signals */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Bot, label: "AI Triage", description: "Instant categorization" },
          { icon: Clock, label: "Fast Response", description: "Routed in seconds" },
          { icon: Shield, label: "Secure", description: "Data encrypted at rest" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <item.icon className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <TicketForm />
    </div>
  );
}
