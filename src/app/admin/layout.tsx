import Link from "next/link";
import { LogOut, Shield } from "lucide-react";

import { requireAdminSession } from "@/lib/admin/access";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin — WebsiteCreditScore",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-panel/60 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 text-sm font-semibold text-foreground" href="/admin">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-accent/15 text-accent">
              <Shield className="size-4" />
            </span>
            Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link className="hover:text-foreground" href="/admin">
              Overview
            </Link>
            <Link className="hover:text-foreground" href="/admin#customers">
              Customers
            </Link>
            <span aria-hidden className="text-border">
              |
            </span>
            <span className="hidden text-muted sm:inline">{session.email || session.name}</span>
            <Link
              className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted hover:text-foreground"
              href="/auth/logout"
            >
              <LogOut className="size-3.5" />
              Sign out
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
