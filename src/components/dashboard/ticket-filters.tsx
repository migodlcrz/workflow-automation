"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  departments: string[];
}

export function TicketFilters({ departments }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  function update(key: string, value: string | null) {
    const qs = createQueryString({ [key]: value });
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("status") ||
    searchParams.has("priority") ||
    searchParams.has("department");

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tickets, names, subjects..."
          defaultValue={searchParams.get("search") ?? ""}
          className="pl-9"
          onChange={(e) => update("search", e.target.value || null)}
        />
      </div>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => update("status", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("priority") ?? "all"}
        onValueChange={(v) => update("priority", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="AI Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {departments.length > 0 && (
        <Select
          value={searchParams.get("department") ?? "all"}
          onValueChange={(v) => update("department", v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
          <X className="mr-1.5 h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
