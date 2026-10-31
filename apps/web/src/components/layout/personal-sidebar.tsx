"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Layers,
  Tag,
  Receipt,
  CreditCard,
  Bell,
  User,
  HelpCircle,
  Package,
  Users,
  FileCheck,
  Repeat,
  UserCog,
  Mail,
  BarChart3,
  Percent,
  Cable,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  Plus,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { useAccount } from "../../context/account-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  visible?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function PersonalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    workspaces,
    activeWorkspace,
    contextType,
    switchWorkspace,
    switchContext,
    isSidebarCollapsed,
    toggleSidebar,
  } = useAccount();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [businessMenuOpen, setBusinessMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isProfessional = pathname === "/dashboard" || pathname?.startsWith("/dashboard") || contextType === "PROFESSIONAL";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setBusinessMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine actual business access from backend membership data
  const businessWorkspaces = (workspaces || []).filter(
    (w) => w.user_role === "OWNER" || w.user_role === "ADMIN" || w.user_role === "STAFF"
  );

  const hasBusinessAccess =
    businessWorkspaces.length > 0 ||
    user?.role === "ADMIN" ||
    user?.role === "STAFF";

  const currentBusiness =
    activeWorkspace ||
    businessWorkspaces[0] ||
    (hasBusinessAccess ? { id: "default-ws", name: "Gowheels", user_role: "OWNER" } : null);

  const effectiveRole =
    currentBusiness?.user_role || (user?.role === "ADMIN" ? "OWNER" : user?.role || "STAFF");

  const isOwnerOrAdmin = effectiveRole === "OWNER" || effectiveRole === "ADMIN";
  const perms = currentBusiness?.permissions;

  // Granular staff permissions
  const canManageProducts = isOwnerOrAdmin || (perms?.can_manage_products ?? true);
  const canManageSubscriptions = isOwnerOrAdmin || (perms?.can_manage_subscriptions ?? true);
  const canManageInvoices = isOwnerOrAdmin || (perms?.can_manage_invoices ?? true);
  const canRecordPayments = isOwnerOrAdmin || (perms?.can_record_payments ?? true);
  const canManageCustomers = isOwnerOrAdmin || (perms?.can_manage_customers ?? true);
  const canViewReports = isOwnerOrAdmin || (perms?.can_view_reports ?? false);
  const canManageTeam = isOwnerOrAdmin || (perms?.can_manage_team ?? false);
  const canManageSettings = isOwnerOrAdmin || (perms?.can_manage_settings ?? false);

  // 1. Personal Main Navigation Items
  const personalNavItems: NavItem[] = [
    { name: "Dashboard", href: "/portal", icon: LayoutGrid },
    { name: "My Subscriptions", href: "/portal/subscriptions", icon: Layers },
    { name: "Offers & Discounts", href: "/portal/plans", icon: Tag, badge: "New" },
    { name: "Payments & Invoices", href: "/portal/invoices", icon: Receipt },
    { name: "Payment Methods", href: "/portal/payments", icon: CreditCard },
    { name: "Notifications", href: "/portal/notifications", icon: Bell },
    { name: "Profile & Settings", href: "/portal/profile", icon: User },
    { name: "Help & Support", href: "/portal/help", icon: HelpCircle },
  ];

  // 2. Full Business Management Navigation (when in Professional mode)
  const professionalNavSections: NavSection[] = [
    {
      title: "BUSINESS MANAGEMENT",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, visible: true },
        { name: "Products & Services", href: "/catalog", icon: Package, visible: canManageProducts },
        { name: "Plans", href: "/catalog?tab=plans", icon: Layers, visible: canManageProducts },
        { name: "Customers & Members", href: "/customers", icon: Users, visible: canManageCustomers },
        { name: "Quotations", href: "/quotations", icon: FileCheck, visible: canManageSubscriptions },
        { name: "Subscriptions", href: "/subscriptions", icon: Repeat, visible: canManageSubscriptions },
        { name: "Invoices", href: "/invoices", icon: Receipt, visible: canManageInvoices },
        { name: "Payments", href: "/payments", icon: CreditCard, visible: canRecordPayments },
      ].filter((i) => i.visible !== false),
    },
    {
      title: "OPERATIONS",
      items: [
        { name: "Team & Staff", href: "/staff", icon: UserCog, visible: canManageTeam },
        { name: "Invitations", href: "/invitations", icon: Mail, visible: canManageTeam },
      ].filter((i) => i.visible !== false),
    },
    {
      title: "CONFIGURATION",
      items: [
        { name: "Analytics & Reports", href: "/reports", icon: BarChart3, visible: canViewReports },
        { name: "Discounts & Offers", href: "/catalog?tab=discounts", icon: Percent, visible: canManageProducts },
        { name: "API & Webhooks", href: "/integrations", icon: Cable, visible: canManageSettings },
        { name: "Business Settings", href: "/settings", icon: Settings, visible: canManageSettings },
      ].filter((i) => i.visible !== false),
    },
  ];

  // 3. Dynamic Personal sections (when in Personal mode with business access)
  const personalBusinessSections: NavSection[] = hasBusinessAccess
    ? [
        {
          title: "BUSINESS MANAGEMENT",
          items: [
            { name: "Products & Services", href: "/catalog", icon: Package, visible: canManageProducts },
            { name: "Plans", href: "/catalog?tab=plans", icon: Layers, visible: canManageProducts },
            { name: "Customers", href: "/customers", icon: Users, visible: canManageCustomers },
            { name: "Quotations", href: "/quotations", icon: FileCheck, visible: canManageSubscriptions },
            { name: "Subscriptions", href: "/subscriptions", icon: Repeat, visible: canManageSubscriptions },
            { name: "Invoices", href: "/invoices", icon: Receipt, visible: canManageInvoices },
            { name: "Payments", href: "/payments", icon: CreditCard, visible: canRecordPayments },
          ].filter((i) => i.visible !== false),
        },
        {
          title: "OPERATIONS",
          items: [
            { name: "Team & Staff", href: "/staff", icon: UserCog, visible: canManageTeam },
            { name: "Invitations", href: "/invitations", icon: Mail, visible: canManageTeam },
          ].filter((i) => i.visible !== false),
        },
        {
          title: "CONFIGURATION",
          items: [
            { name: "Analytics & Reports", href: "/reports", icon: BarChart3, visible: canViewReports },
            { name: "Discounts & Offers", href: "/catalog?tab=discounts", icon: Percent, visible: canManageProducts },
            { name: "API & Webhooks", href: "/integrations", icon: Cable, visible: canManageSettings },
            { name: "Business Settings", href: "/settings", icon: Settings, visible: canManageSettings },
          ].filter((i) => i.visible !== false),
        },
      ]
    : [];

  const isItemActive = (href: string) => {
    if (href === "/portal") return pathname === "/portal";
    if (href === "/dashboard") return pathname === "/dashboard";
    const cleanHref = href.split("?")[0];
    return pathname === cleanHref || pathname.startsWith(cleanHref + "/");
  };

  const renderNavLink = (item: NavItem) => {
    const active = isItemActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.name + item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        title={isSidebarCollapsed ? item.name : undefined}
        className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
          active
            ? "bg-[#F3E8FF] text-[#7651F5] font-bold shadow-2xs"
            : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
        } ${isSidebarCollapsed ? "justify-center px-0 h-9 w-9 mx-auto" : ""}`}
      >
        <Icon
          className={`h-4 w-4 shrink-0 transition-colors ${
            active ? "text-[#7651F5]" : "text-slate-400 group-hover:text-[#7651F5]"
          }`}
        />
        {!isSidebarCollapsed && (
          <span className="truncate flex-1">{item.name}</span>
        )}
        {!isSidebarCollapsed && item.badge && !active && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

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
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-xs shadow-xs">
              FG
            </div>
            <span className="font-heading font-black text-sm tracking-tight text-[#0B1020]">
              FlowGrid
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {isProfessional ? (currentBusiness?.name || "Business") : "Personal"}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-[#E8ECF3] transition-all duration-300 ease-in-out shadow-2xs ${
          isSidebarCollapsed ? "w-[72px]" : "w-[240px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header with Business Switcher */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E8ECF3] shrink-0 relative" ref={menuRef}>
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <Link
              href={isProfessional ? "/dashboard" : "/portal"}
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-purple-500/20 shrink-0"
            >
              FG
            </Link>

            {!isSidebarCollapsed && (
              <div className="truncate flex-1">
                {hasBusinessAccess ? (
                  <button
                    onClick={() => setBusinessMenuOpen(!businessMenuOpen)}
                    className="flex items-center gap-1.5 text-left group w-full focus:outline-none cursor-pointer"
                    title="Switch business workspace"
                  >
                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-heading font-black text-base tracking-tight text-[#0B1020]">
                          FlowGrid
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7651F5] transition-colors shrink-0" />
                      </div>
                      <span className="text-[11px] font-semibold tracking-wider text-[#64748B] block -mt-0.5 truncate group-hover:text-[#7651F5] transition-colors">
                        {currentBusiness?.name || "Gowheels"}
                      </span>
                    </div>
                  </button>
                ) : (
                  <Link href="/portal" className="block truncate">
                    <span className="font-heading font-black text-base tracking-tight text-[#0B1020] block">
                      FlowGrid
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider text-[#64748B] block -mt-0.5">
                      Personal Account
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 rounded-lg border border-[#E8ECF3] bg-white hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 items-center justify-center text-slate-400 transition-all shadow-2xs ml-1 cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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

          {/* Business Switcher Popover */}
          {businessMenuOpen && hasBusinessAccess && !isSidebarCollapsed && (
            <div className="absolute top-[62px] left-3 right-3 bg-white rounded-2xl border border-[#E8ECF3] shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Your Businesses ({workspaces.length})
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto mt-1">
                {(businessWorkspaces.length > 0
                  ? businessWorkspaces
                  : [{ id: "gowheels-ws", name: "Gowheels", user_role: "OWNER" }]
                ).map((ws: any) => {
                  const isSelected = (currentBusiness?.id || currentBusiness?.name) === (ws.id || ws.name);
                  return (
                    <button
                      key={ws.id || ws.name}
                      onClick={() => {
                        switchWorkspace(ws.id || ws);
                        setBusinessMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 text-[#7651F5] font-semibold"
                          : "hover:bg-slate-50 text-[#0B1020]"
                      }`}
                    >
                      <div className="truncate flex-1 pr-2">
                        <div className="font-semibold truncate">{ws.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {ws.user_role?.toLowerCase() || "Owner"}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#7651F5] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#E8ECF3] mt-2 pt-2">
                <Link
                  href="/account"
                  onClick={() => setBusinessMenuOpen(false)}
                  className="flex items-center gap-2 p-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#7651F5] hover:bg-purple-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage Workspaces</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 [scrollbar-width:thin] [scrollbar-color:#E2E8F0_transparent]">
          {isProfessional ? (
            /* PROFESSIONAL VIEW: Full Business Management Navigation */
            professionalNavSections.map((section, idx) => (
              <div key={section.title} className={idx > 0 ? "pt-2" : ""}>
                {idx > 0 && <div className="border-t border-[#E8ECF3] my-2 mx-1" />}
                {!isSidebarCollapsed && (
                  <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                    {section.title}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map(renderNavLink)}
                </div>
              </div>
            ))
          ) : (
            /* PERSONAL VIEW: Main Navigation + Dynamic Business Options */
            <>
              <div className="space-y-1">
                {personalNavItems.map(renderNavLink)}
              </div>

              {hasBusinessAccess &&
                personalBusinessSections.map((section) => {
                  if (section.items.length === 0) return null;
                  return (
                    <div key={section.title} className="pt-2">
                      <div className="border-t border-[#E8ECF3] my-2 mx-1" />
                      {!isSidebarCollapsed && (
                        <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">
                          {section.title}
                        </div>
                      )}
                      <div className="space-y-1">
                        {section.items.map(renderNavLink)}
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </nav>

        {/* Bottom Switch Pill */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-[#E8ECF3] bg-slate-50/50">
            {isProfessional ? (
              <button
                onClick={() => {
                  switchContext("PERSONAL");
                  router.push("/portal");
                }}
                className="w-full p-2.5 rounded-xl bg-white border border-[#E8ECF3] hover:border-purple-200 hover:bg-purple-50/50 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="font-bold text-xs text-[#0B1020] flex items-center justify-between group-hover:text-[#7651F5]">
                  <span>Switch to Personal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7651F5] transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Personal subscriptions, offers & billing
                </p>
              </button>
            ) : (
              <button
                onClick={() => {
                  switchContext("PROFESSIONAL", activeWorkspace?.id);
                  router.push("/dashboard");
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 hover:border-purple-200 text-left transition-all group shadow-2xs cursor-pointer"
              >
                <div className="font-bold text-xs text-[#7651F5] flex items-center justify-between">
                  <span>Switch to Professional</span>
                  <Briefcase className="w-3.5 h-3.5 text-[#7651F5] transition-transform group-hover:scale-110" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Manage {currentBusiness?.name || "business"}, MRR & staff
                </p>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
