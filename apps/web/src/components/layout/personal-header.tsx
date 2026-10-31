"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Layers,
  CreditCard,
  LogOut,
  Briefcase,
  Check,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAccount } from "../../context/account-context";

interface PersonalHeaderProps {
  onSearch?: (query: string) => void;
}

export function PersonalHeader({ onSearch }: PersonalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, workspaces, activeWorkspace, contextType, switchContext, switchWorkspace, logout } = useAccount();

  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const isProfessional = pathname?.startsWith("/dashboard") || contextType === "PROFESSIONAL";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const getInitials = () => {
    if (!user) return "AA";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || "AA";
  };

  const displayName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Aloshy Antony"
    : "Aloshy Antony";

  const ownedWorkspaces = workspaces.filter((w) => w.user_role === "OWNER" || w.user_role === "ADMIN" || w.user_role === "STAFF");

  const handleSwitchToProfessional = (workspaceId?: string) => {
    setDropdownOpen(false);
    const targetWs = workspaceId || activeWorkspace?.id || ownedWorkspaces[0]?.id;
    switchContext("PROFESSIONAL", targetWs);
    router.push("/dashboard");
  };

  const handleSwitchToPersonal = () => {
    setDropdownOpen(false);
    switchContext("PERSONAL");
    router.push("/portal");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E8ECF3] bg-white/95 px-6 backdrop-blur-sm">
      {/* Search Input - Pill Shaped */}
      <div className="flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={isProfessional ? "Search metrics, customers, invoices..." : "Search your subscriptions, invoices..."}
            className="w-full rounded-full border border-[#E8ECF3] bg-slate-50/70 pl-10 pr-4 py-2 text-xs text-[#0B1020] placeholder-slate-400 focus:border-[#7651F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7651F5]/10 transition-all"
          />
        </div>
      </div>

      {/* Right Navigation Elements */}
      <div className="flex items-center gap-3">
        {/* Prominent Context Switch Button */}
        {!isProfessional ? (
          <button
            onClick={() => handleSwitchToProfessional()}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#7651F5] to-[#4387F7] text-white text-xs font-semibold shadow-xs hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            title="Immediately open Business Management Dashboard"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Switch to Professional</span>
          </button>
        ) : (
          <button
            onClick={handleSwitchToPersonal}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8ECF3] text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 hover:text-[#7651F5] transition-all cursor-pointer"
            title="Switch to Personal Subscriptions Dashboard"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#7651F5]" />
            <span>Switch to Personal</span>
          </button>
        )}

        {/* Notification Bell */}
        <Link
          href="/portal/notifications"
          onClick={() => setHasUnreadNotifications(false)}
          className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {hasUnreadNotifications && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile Pill */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2 rounded-full hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7651F5]/20 cursor-pointer"
            aria-label="User profile menu"
          >
            {/* Avatar with Initials */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-heading font-black text-xs shadow-xs">
              {getInitials()}
            </div>

            {/* User Name & Account Subtext */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0B1020] truncate max-w-[130px]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#64748B] -mt-0.5">
                {isProfessional ? (activeWorkspace?.name || "Business Account") : "Personal Account"}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E8ECF3] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#E8ECF3]">
                <div className="font-bold text-xs text-[#0B1020] truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-[#64748B] truncate">
                  {user?.email || "user@flowgrid.com"}
                </div>
                <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  isProfessional
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-purple-50 text-[#7651F5] border-purple-200"
                }`}>
                  {isProfessional ? "Professional View" : "Personal Account"}
                </span>
              </div>

              {/* Main Switch to Professional / Switch to Personal Action */}
              <div className="p-2 border-b border-[#E8ECF3] bg-slate-50/50">
                {!isProfessional ? (
                  <button
                    onClick={() => handleSwitchToProfessional()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#7651F5] to-[#4387F7] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Switch to Professional</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSwitchToPersonal}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white border border-[#E8ECF3] text-slate-700 font-bold text-xs shadow-2xs hover:bg-slate-50 hover:text-[#7651F5] transition-all cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#7651F5]" />
                    <span>Switch to Personal</span>
                  </button>
                )}
              </div>

              <div className="py-1 text-xs">
                <Link
                  href="/portal/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Profile & Settings</span>
                </Link>
                <Link
                  href="/portal/subscriptions"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Subscriptions</span>
                </Link>
                <Link
                  href="/portal/invoices"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Payments & Invoices</span>
                </Link>
              </div>

              {/* Business Selector (if user owns workspaces) */}
              {ownedWorkspaces.length > 0 && (
                <div className="border-t border-[#E8ECF3] py-1 text-xs">
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Businesses ({ownedWorkspaces.length})
                  </div>
                  {ownedWorkspaces.slice(0, 3).map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleSwitchToProfessional(ws.id)}
                      className="w-full flex items-center justify-between px-4 py-1.5 text-left text-slate-700 hover:bg-purple-50 hover:text-[#7651F5] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3 h-3 text-[#7651F5] shrink-0" />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {ws.user_role}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sign Out */}
              <div className="border-t border-[#E8ECF3] pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
