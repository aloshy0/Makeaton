"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Layers,
  UserCheck,
  Users,
  ShieldAlert,
  CreditCard,
  FileCheck,
  UserCog,
  ClipboardCheck,
  History,
  Cable,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Workspace } from "../../types";
import { useAccount } from "../../context/account-context";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, switchWorkspace, user } = useAccount();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const ownedCount = workspaces.filter((w) => w.user_role === "OWNER").length;
  const userRole = activeWorkspace?.user_role || "OWNER";
  const planMax = user?.flowgrid_plan?.max_workspaces || 3;

  // Categorized Navigation
  const navSections = [
    {
      label: "Core Operations",
      items: [
        {
          name: "Executive Dashboard",
          href: "/dashboard",
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
        {
          name: "Payments & Refunds",
          href: "/payments",
          icon: CreditCard,
          roles: ["OWNER", "ADMIN", "STAFF"],
        },
        {
          name: "Customers",
          href: "/customers",
          icon: Users,
          roles: ["OWNER", "ADMIN", "STAFF"],
        },
        {
          name: "Quotations",
          href: "/quotations",
          icon: FileCheck,
          roles: ["OWNER", "ADMIN", "STAFF"],
        },
        {
          name: "Products & Plans",
          href: "/catalog",
          icon: Layers,
          roles: ["OWNER", "ADMIN"],
        },
      ],
    },
    {
      label: "Governance & Team",
      items: [
        {
          name: "Team & Staff",
          href: "/staff",
          icon: UserCog,
          roles: ["OWNER", "ADMIN"],
        },
        {
          name: "Approvals",
          href: "/approvals",
          icon: ClipboardCheck,
          roles: ["OWNER", "ADMIN", "STAFF"],
        },
        {
          name: "Audit Trail",
          href: "/audit-logs",
          icon: History,
          roles: ["OWNER", "ADMIN"],
        },
      ],
    },
    {
      label: "Platform & Growth",
      items: [
        {
          name: "External Integrations",
          href: "/integrations",
          icon: Cable,
          roles: ["OWNER"],
        },
        {
          name: "Reports & Analytics",
          href: "/reports",
          icon: BarChart3,
          roles: ["OWNER", "ADMIN"],
        },
        {
          name: "Workspace Settings",
          href: "/settings",
          icon: Settings,
          roles: ["OWNER", "ADMIN"],
        },
      ],
    },
    {
      label: "Account & FlowGrid",
      items: [
        {
          name: "Personal Account & Plans",
          href: "/account",
          icon: UserCheck,
          roles: ["OWNER", "ADMIN", "STAFF", "CUSTOMER"],
        },
        {
          name: "Workspaces Directory",
          href: "/workspaces",
          icon: Building2,
          roles: ["OWNER", "ADMIN", "STAFF", "CUSTOMER"],
        },
        {
          name: "Customer Portal",
          href: "/portal",
          icon: Users,
          roles: ["OWNER", "ADMIN", "STAFF", "CUSTOMER"],
        },
      ],
    },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white font-bold font-heading shadow-md shadow-purple-500/20">
            FG
          </div>
          <div className="truncate">
            <span className="text-sm font-semibold tracking-tight text-white block font-heading">
              FlowGrid
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Subscription Platform
            </span>
          </div>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-slate-800/80">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
            Active Workspace
          </div>
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={activeWorkspace}
            onSelectWorkspace={(ws) => switchWorkspace(ws)}
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
                Sensitive operations (early closures, custom refunds) require Admin approval.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto">
          {navSections.map((sec) => {
            const visibleItems = sec.items.filter((item) => item.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.label} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {sec.label}
                </div>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-indigo-600/20 text-indigo-400 font-semibold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>Workspaces:</span>
            <span className="font-semibold text-slate-300">
              {ownedCount} / {planMax < 9999 ? planMax : "Unlimited"}
            </span>
          </div>
        </div>
      </aside>

      <CreateWorkspaceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onWorkspaceCreated={(newWs) => {
          switchWorkspace(newWs);
          setIsCreateDialogOpen(false);
        }}
        ownedCount={ownedCount}
        maxSlots={planMax}
      />

    </>
  );
}
