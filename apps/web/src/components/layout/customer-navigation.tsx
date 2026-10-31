"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Repeat,
  CalendarCheck,
  Receipt,
  CreditCard,
  User as UserIcon,
  ArrowRight,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { ProfileMenu } from "./profile-menu";

const CUSTOMER_NAV = [
  { name: "Overview", href: "/portal", icon: LayoutDashboard },
  { name: "Browse Plans", href: "/portal/plans", icon: Sparkles },
  { name: "My Subscriptions", href: "/portal/subscriptions", icon: Repeat },
  { name: "Renewals", href: "/portal/renewals", icon: CalendarCheck },
  { name: "Invoices", href: "/portal/invoices", icon: Receipt },
  { name: "Payments", href: "/portal/payments", icon: CreditCard },
  { name: "Profile", href: "/portal/profile", icon: UserIcon },
];

export function CustomerNavigation() {
  const pathname = usePathname();
  const { switchContext, activeWorkspace } = useAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E8ECF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Personal Badge */}
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#11B9D4] text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-emerald-600/15">
                FG
              </div>
              <div>
                <span className="font-heading font-black text-base tracking-tight text-[#0B1020] block">
                  FlowGrid
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 block -mt-0.5">
                  Personal Account
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {CUSTOMER_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Quick Business Switcher & Instagram-style Profile Menu */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => switchContext("PROFESSIONAL")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8ECF3] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#0B1020] transition-colors"
              title="Switch back to business workspace"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#7651F5]" />
              <span className="truncate max-w-[120px]">{activeWorkspace?.name || "Business"}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>

            <ProfileMenu />

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8ECF3] bg-white px-4 py-3 space-y-1">
          {CUSTOMER_NAV.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                switchContext("PROFESSIONAL");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 text-[#7651F5] font-semibold text-xs"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Switch to {activeWorkspace?.name || "Business Workspace"}</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
