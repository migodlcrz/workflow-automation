import type { Metadata } from "next";
import { Suspense } from "react";
import { getTickets, getTicketStats, getUniqueDepartments } from "@/lib/supabase/queries";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TicketFilters } from "@/components/dashboard/ticket-filters";
import { TicketsTable } from "@/components/dashboard/tickets-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { TicketFilters as TicketFiltersType } from "@/types/ticket";

export const metadata: Metadata = { title: "Support Dashboard" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    status?: string;
    department?: string;
    priority?: string;
    search?: string;
  }>;
}

async function DashboardContent({ filters }: { filters: TicketFiltersType }) {
  const [tickets, stats, departments] = await Promise.all([
    getTickets(filters),
    getTicketStats(),
    getUniqueDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <div className="space-y-4">
        <TicketFilters departments={departments} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <TicketsTable tickets={tickets} />
      </div>
    </div>
  );
}

export default async function SupportDashboard({ searchParams }: Props) {
  const params = await searchParams;

  const filters: TicketFiltersType = {
    status: params.status as TicketFiltersType["status"],
    department: params.department,
    priority: params.priority as TicketFiltersType["priority"],
    search: params.search,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Support Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View, search, and manage all support tickets with AI-generated insights.
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent filters={filters} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
