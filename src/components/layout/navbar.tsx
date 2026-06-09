import Link from "next/link";
import { Ticket, LayoutDashboard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Ticket className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>SupportOps</span>
          <span className="text-muted-foreground font-normal">Automation</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/submit">Submit Ticket</Link>
          </Button>
          <Separator orientation="vertical" className="mx-1 h-4" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/support" className="flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/support/analytics" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
