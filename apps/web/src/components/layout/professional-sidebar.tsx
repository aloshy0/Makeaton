"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Users,
  Repeat,
  Receipt,
  CreditCard,
  FileCheck,
  UserCog,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { WorkspaceSwitcher } from "./workspace-switcher";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"OWNER" | "ADMIN" | "STAFF">;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
    ],
  },
  {
    title: "COMMERCE",
    items: [
      {
        name: "Subscriptions",
        href: "/subscriptions",
        icon: Repeat,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
      {
        name: "Invoices",
        href: "/invoices",
        icon: Receipt,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
      {
        name: "Payments",
        href: "/payments",
        icon: CreditCard,
        roles: ["OWNER", "ADMIN"],
      },
      {
        name: "Customers",
        href: "/customers",
        icon: Users,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
    ],
  },
  {
    title: "CATALOG",
    items: [
      {
        name: "Plans & Catalog",
        href: "/catalog",
        icon: Layers,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
      {
        name: "Quotations",
        href: "/quotations",
        icon: FileCheck,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        name: "Approvals",
        href: "/approvals",
        icon: ShieldCheck,
        roles: ["OWNER", "ADMIN", "STAFF"],
      },
      {
        name: "Team & Staff",
        href: "/staff",
        icon: UserCog,
        roles: ["OWNER", "ADMIN"],
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["OWNER"],
      },
    ],
  },
];

export function ProfessionalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    activeWorkspace,
    workspaces,
    switchWorkspace,
    isSidebarCollapsed,
    toggleSidebar,
    logout,
  } = useAccount();

  const [mobileOpen, setMobileOpen] = useState(false);
  const userRole = activeWorkspace?.user_role || "OWNER";

  const getInitials = (name?: string) => {
    if (!name) return "FG";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-[#E8ECF3] fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-xs shadow-xs">
              FG
            </div>
            <span className="font-heading font-black text-sm tracking-tight text-[#0B1020]">
              FlowGrid
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#E8ECF3] transition-all duration-300 ease-in-out shadow-2xs ${
          isSidebarCollapsed ? "w-[68px]" : "w-[245px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#E8ECF3] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-purple-600/20 shrink-0">
              FG
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <span className="font-heading font-black text-base tracking-tight text-[#0B1020] block">
                  FlowGrid
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#7651F5] block -mt-0.5">
                  Business OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Smooth Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 rounded-lg border border-[#E8ECF3] bg-white hover:bg-purple-50 hover:text-[#7651F5] hover:border-purple-200 items-center justify-center text-slate-400 transition-all shadow-2xs"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Switcher Header */}
        {!isSidebarCollapsed ? (
          <div className="p-3 border-b border-[#E8ECF3] bg-slate-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 px-0.5 flex items-center justify-between">
              <span>Workspace</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-50 text-[#7651F5] border border-purple-200">
                {userRole}
              </span>
            </div>
            <WorkspaceSwitcher
              workspaces={workspaces}
              currentWorkspace={activeWorkspace}
              onSelectWorkspace={(ws) => switchWorkspace(ws.id)}
              onCreateWorkspaceClick={() => router.push("/workspaces")}
              ownedCount={user?.owned_workspaces_count || 1}
            />
          </div>
        ) : (
          <div className="p-2 border-b border-[#E8ECF3] flex justify-center">
            <button
              onClick={toggleSidebar}
              title={`Active: ${activeWorkspace?.name || "Workspace"} (Click to expand)`}
              className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-[#7651F5] flex items-center justify-center font-heading font-extrabold text-xs hover:bg-purple-100 transition-colors shadow-2xs"
            >
              {activeWorkspace?.name?.slice(0, 2).toUpperCase() || "WS"}
            </button>
          </div>
        )}

        {/* Navigation List — with NO Native Scrollbar and Compact Spacing */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-2.5 space-y-3.5">
          {SECTIONS.map((section) => {
            const filteredItems = section.items.filter((item) =>
              item.roles.includes(userRole as any)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {!isSidebarCollapsed ? (
                  <div className="px-2.5 pb-1 text-[9px] font-bold tracking-wider uppercase text-[#94A3B8]">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-1" />
                )}

                {filteredItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <div key={item.name} className="relative group">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-purple-50 text-[#7651F5] font-bold shadow-2xs"
                            : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
                        } ${isSidebarCollapsed ? "justify-center px-0 h-9 w-9 mx-auto" : ""}`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-[#7651F5]"
                              : "text-slate-400 group-hover:text-[#7651F5]"
                          }`}
                        />
                        {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>

                      {/* Tooltip for collapsed mode */}
                      {isSidebarCollapsed && (
                        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:flex z-50 rounded-lg bg-[#0B1020] px-2.5 py-1 text-[11px] font-medium text-white shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                          {item.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Minimal Profile Footer */}
        <div className="p-2.5 border-t border-[#E8ECF3] bg-slate-50/50 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-1 rounded-xl">
              <div className="flex items-center gap-2 truncate">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {getInitials(user ? `${user.first_name} ${user.last_name}` : "Demo")}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#0B1020] truncate">
                    {user ? `${user.first_name} ${user.last_name}` : "Demo User"}
                  </div>
                  <div className="text-[10px] text-[#64748B] truncate">
                    {user?.email || "demo@flowgrid.local"}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={logout}
                title={`Signed in as ${user?.email || "demo@flowgrid.local"} (Click to sign out)`}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-bold text-xs shadow-2xs hover:opacity-80 transition-opacity"
              >
                {getInitials(user ? `${user.first_name} ${user.last_name}` : "Demo")}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
