"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Check,
  Plus,
  Grid,
  Sparkles,
  LogOut,
  Settings,
  ChevronDown,
  Building2,
  Repeat,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { useAccount } from "../../context/account-context";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function ProfileMenu() {
  const router = useRouter();
  const {
    user,
    contextType,
    activeWorkspace,
    workspaces,
    switchContext,
    switchWorkspace,
    createWorkspace,
    logout,
  } = useAccount();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "FG";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-[#7651F5] border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-[#4387F7] border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#7651F5]/30"
          aria-label="Profile and account switching menu"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {getInitials(user ? `${user.first_name} ${user.last_name}` : "FlowGrid")}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#0B1020] truncate max-w-[120px]">
              {user ? `${user.first_name} ${user.last_name}` : "Account"}
            </span>
            <span className="text-[10px] text-[#64748B] flex items-center gap-1">
              {contextType === "PROFESSIONAL" ? (
                <>
                  <Briefcase className="w-2.5 h-2.5 text-[#7651F5]" />
                  <span className="truncate max-w-[100px]">
                    {activeWorkspace?.name || "Business"}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Personal Account</span>
                </>
              )}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E8ECF3] shadow-xl shadow-slate-900/10 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Top User Profile Section */}
            <div className="px-4 py-2 border-b border-[#E8ECF3] flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#7651F5] to-[#4387F7] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                {getInitials(user ? `${user.first_name} ${user.last_name}` : "FlowGrid")}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-semibold text-sm text-[#0B1020] truncate">
                  {user ? `${user.first_name} ${user.last_name}` : "FlowGrid Member"}
                </div>
                <div className="text-xs text-[#64748B] truncate">
                  {user?.email || "alexander@flowgrid.com"}
                </div>
                <div className="mt-1">
                  <Link
                    href="/account"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-medium text-[#7651F5] hover:underline flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Personal Account & Plans</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Professional Workspaces (Instagram-style accounts) */}
            <div className="py-2 border-b border-[#E8ECF3]">
              <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#7651F5]" />
                  <span>Business Workspaces</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-mono">
                  {workspaces.length}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto px-2 space-y-1">
                {workspaces.map((ws) => {
                  const isCurrent = contextType === "PROFESSIONAL" && activeWorkspace?.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        switchWorkspace(ws.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                        isCurrent
                          ? "bg-purple-50/80 border border-purple-200/60 shadow-sm"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isCurrent
                              ? "bg-[#7651F5] text-white"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {ws.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-[#0B1020] truncate">
                            {ws.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getRoleBadgeColor(
                                ws.user_role
                              )}`}
                            >
                              {ws.user_role || "STAFF"}
                            </span>
                            {ws.currency && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({ws.currency})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="h-5 w-5 rounded-full bg-[#7651F5] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Workspace Navigation Actions */}
              <div className="px-3 pt-2 grid grid-cols-2 gap-2 text-xs">
                <Link
                  href="/workspaces"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#E8ECF3] bg-slate-50 hover:bg-slate-100 text-[#0B1020] font-medium text-[11px] transition-colors"
                >
                  <Grid className="w-3.5 h-3.5 text-slate-500" />
                  <span>All Workspaces</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-[#7651F5] font-semibold text-[11px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Workspace</span>
                </button>
              </div>
            </div>

            {/* Personal Customer Account Section */}
            <div className="py-2 border-b border-[#E8ECF3] px-2">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personal Account</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border mt-1 transition-all ${
                  contextType === "PERSONAL"
                    ? "bg-emerald-50/80 border-emerald-200 shadow-sm"
                    : "bg-slate-50/70 border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#0B1020] flex items-center gap-1.5">
                      <span>Personal Subscriber</span>
                      {contextType === "PERSONAL" && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Your subscriptions, invoices and payments.
                    </p>
                  </div>
                  {contextType === "PERSONAL" ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        switchContext("PERSONAL");
                        setIsOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E8ECF3] text-xs font-semibold text-[#0B1020] hover:border-[#7651F5] hover:text-[#7651F5] shadow-xs transition-colors flex-shrink-0"
                    >
                      Switch
                    </button>
                  )}
                </div>

                {contextType === "PERSONAL" && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                    <Link
                      href="/portal/subscriptions"
                      onClick={() => setIsOpen(false)}
                      className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                    >
                      <Repeat className="w-3 h-3" />
                      <span>My Subscriptions</span>
                    </Link>
                    <Link
                      href="/portal/plans"
                      onClick={() => setIsOpen(false)}
                      className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Browse Plans</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Footer */}
            <div className="px-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of FlowGrid</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={(ws) => {
          createWorkspace({
            name: ws.name,
            currency: ws.currency,
            timezone: ws.timezone,
            description: "New business organization created on FlowGrid.",
          });
        }}
        ownedCount={workspaces.filter((w) => w.user_role === "OWNER").length}
      />
    </>
  );
}
