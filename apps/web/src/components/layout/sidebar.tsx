"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Layers,
  UserCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { cn } from "../../lib/utils";

const navigation = [
  { name: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/subscriptions", icon: Repeat },
  { name: "Billing & Invoices", href: "/invoices", icon: Receipt },
  { name: "Products & Plans", href: "/catalog", icon: Layers },
  { name: "Customer Portal", href: "/portal", icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
          BL
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight text-white block">
            Brightloop Software
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Subscription Platform
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footbar */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">System Engine</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Online
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 leading-relaxed">
            Auto billing & PostgreSQL 18 active
          </div>
        </div>
      </div>
    </aside>
  );
}
