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
  Mail,
  BarChart3,
  Cable,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { ProfileMenu } from "./profile-menu";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"OWNER" | "ADMIN" | "STAFF">;
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
    title: "BUSINESS",
    items: [
      {
        name: "Catalog & Plans",
        href: "/catalog",
        icon: Layers,
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
        name: "Invitations",
        href: "/invitations",
        icon: Mail,
        roles: ["OWNER", "ADMIN"],
      },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      {
        name: "Analytics & Reports",
        href: "/reports",
        icon: BarChart3,
        roles: ["OWNER", "ADMIN"],
      },
      {
        name: "API & Webhooks",
        href: "/integrations",
        icon: Cable,
        roles: ["OWNER", "ADMIN"],
      },
      {
        name: "Workspace Settings",
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
  const { user, activeWorkspace, workspaces, switchWorkspace, isSidebarCollapsed, toggleSidebar } =
    useAccount();

  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = activeWorkspace?.user_role || "OWNER";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-[#E8ECF3] fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-heading font-black text-xs shadow-xs">
              FG
            </div>
            <span className="font-heading font-black text-sm tracking-tight text-[#0B1020]">
              FlowGrid
            </span>
          </div>
        </div>

        <ProfileMenu />
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8ECF3] shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-purple-600/20 shrink-0">
              FG
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <span className="font-heading font-black text-base tracking-tight text-[#0B1020] block">
                  FlowGrid
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#7651F5] block -mt-0.5">
                  Business OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Smooth Toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 rounded-lg border border-[#E8ECF3] bg-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 items-center justify-center text-slate-400 transition-all shadow-2xs"
            title={isSidebarCollapsed ? "Expand Sidebar (245px)" : "Collapse Sidebar (68px)"}
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
          <div className="p-2.5 border-b border-[#E8ECF3] flex justify-center">
            <Link
              href="/workspaces"
              title={`Switch Workspace (Active: ${activeWorkspace?.name || "Workspace"})`}
              className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-200 text-[#7651F5] flex items-center justify-center font-heading font-extrabold text-xs hover:bg-purple-100 transition-colors shadow-2xs"
            >
              {activeWorkspace?.name?.slice(0, 2).toUpperCase() || "WS"}
            </Link>
          </div>
        )}

        {/* Navigation List — with Hidden Native Scrollbars */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((section) => {
            const filteredItems = section.items.filter((item) =>
              item.roles.includes(userRole as any)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-0.5">
                {!isSidebarCollapsed ? (
                  <div className="px-2 pb-1 text-[9px] font-bold tracking-wider uppercase text-[#64748B]">
                    {section.title}
                  </div>
                ) : (
                  <div className="h-1.5" />
                )}

                {filteredItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={`group flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-purple-50/80 text-[#7651F5] font-bold border-r-2 border-[#7651F5]"
                          : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
                      } ${isSidebarCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : ""}`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? "text-[#7651F5]" : "text-slate-400 group-hover:text-[#7651F5]"
                        }`}
                      />
                      {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer with Profile & Switcher */}
        <div className="p-2.5 border-t border-[#E8ECF3] bg-slate-50/40">
          <ProfileMenu />
        </div>
      </aside>
    </>
  );
}
