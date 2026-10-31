"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Layers,
  UserCheck,
  Building2,
  Users,
  ShieldAlert,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Workspace } from "../../types";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "aac3abe7-18b7-4c5f-a29e-786b63476459",
      name: "Brightloop Cloud Services",
      slug: "brightloop-cloud",
      currency: "USD",
      timezone: "America/New_York",
      is_active: true,
      user_role: "OWNER",
      active_members_count: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Brightloop Hardware Labs",
      slug: "brightloop-hardware",
      currency: "EUR",
      timezone: "Europe/London",
      is_active: true,
      user_role: "OWNER",
      active_members_count: 1,
      created_at: new Date().toISOString(),
    },
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(workspaces[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const ownedCount = workspaces.filter((w) => w.user_role === "OWNER").length;

  const userRole = currentWorkspace?.user_role || "OWNER";

  // Navigation items based on role
  const navigation = [
    {
      name: "Executive Dashboard",
      href: "/",
      icon: LayoutDashboard,
      roles: ["OWNER", "ADMIN", "STAFF"],
    },
    {
      name: "Subscriptions",
      href: "/subscriptions",
      icon: Repeat,
      roles: ["OWNER", "ADMIN", "STAFF"],
    },
    {
      name: "Billing & Invoices",
      href: "/invoices",
      icon: Receipt,
      roles: ["OWNER", "ADMIN", "STAFF"],
    },
    { name: "Products & Plans", href: "/catalog", icon: Layers, roles: ["OWNER", "ADMIN"] },
    {
      name: "Customer Portal",
      href: "/portal",
      icon: UserCheck,
      roles: ["OWNER", "ADMIN", "STAFF", "CUSTOMER"],
    },
  ];

  const allowedNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
            BL
          </div>
          <div className="truncate">
            <span className="text-sm font-semibold tracking-tight text-white block">
              Brightloop SaaS
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Subscription Engine
            </span>
          </div>
        </div>

        {/* Workspace Switcher Component */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Active Workspace
          </div>
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onSelectWorkspace={(ws) => setCurrentWorkspace(ws)}
            onCreateWorkspaceClick={() => setIsCreateDialogOpen(true)}
            ownedCount={ownedCount}
          />
        </div>

        {/* Staff Notice banner if role is STAFF */}
        {userRole === "STAFF" && (
          <div className="mx-3 mt-3 rounded-lg border border-amber-800/60 bg-amber-950/30 p-2.5 text-[11px] text-amber-300/90 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold block">Staff Operational Mode</span>
              <span>
                Sensitive actions (early closures, custom discounts) require Admin approval.
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace Operations
          </div>
          {allowedNav.map((item) => {
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
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>Slots Used:</span>
            <span className="font-semibold text-slate-300">{ownedCount} / 5</span>
          </div>
        </div>
      </aside>

      <CreateWorkspaceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onWorkspaceCreated={(newWs) => {
          setWorkspaces([...workspaces, newWs]);
          setCurrentWorkspace(newWs);
        }}
        ownedCount={ownedCount}
      />
    </>
  );
}
