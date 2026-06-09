import Link from "next/link";
import { ArrowRight, Bot, Database, Sheet, Zap, CheckCircle2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Ticket Submission",
    description: "Clean, validated form with real-time feedback. Tickets saved immediately to Supabase.",
  },
  {
    icon: Bot,
    title: "AI-Powered Triage",
    description: "Groq LLM automatically categorizes, prioritizes, and routes every ticket with a confidence score.",
  },
  {
    icon: Database,
    title: "PostgreSQL Backend",
    description: "Supabase-hosted PostgreSQL with row-level security, auto-numbering, and indexed queries.",
  },
  {
    icon: Sheet,
    title: "Google Sheets Sync",
    description: "Every ticket and its AI metadata is automatically synced to a Google Sheet for stakeholder visibility.",
  },
  {
    icon: LayoutDashboard,
    title: "Support Dashboard",
    description: "Full-featured internal dashboard with search, filtering, status management, and AI analysis view.",
  },
  {
    icon: CheckCircle2,
    title: "End-to-End Workflow",
    description: "From submission to resolution: a complete ticket lifecycle with every state tracked and auditable.",
  },
];

const WORKFLOW_STEPS = [
  { step: "01", label: "User submits ticket via Next.js form" },
  { step: "02", label: "Server Action validates & saves to Supabase" },
  { step: "03", label: "Groq AI triages: category, priority, team, tags" },
  { step: "04", label: "AI metadata written back to Supabase" },
  { step: "05", label: "Google Sheets row created/updated" },
  { step: "06", label: "Support agent handles via dashboard" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <Badge variant="secondary" className="text-xs">
          AI-Powered Support Operations
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Internal Support, <br />
          <span className="text-primary">Automated End-to-End</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          SupportOps Automation routes, triages, and tracks every support ticket using AI — so your team
          spends time resolving issues, not sorting them.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/submit">
              Submit a Ticket
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/support">View Dashboard</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Workflow */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
          <p className="mt-2 text-muted-foreground">Six steps from submission to resolution</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW_STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-4 rounded-lg border p-4">
              <span className="text-2xl font-bold text-primary/30">{s.step}</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Platform Features</h2>
          <p className="mt-2 text-muted-foreground">Built for real production support operations</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">{f.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">Ready to submit a ticket?</h2>
          <p className="text-muted-foreground">
            Your ticket will be triaged by AI within seconds and routed to the right team.
          </p>
          <Button asChild size="lg">
            <Link href="/submit">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
