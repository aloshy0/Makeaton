"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  PlusCircle,
  Check,
  Sparkles,
  User,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Workspace } from "../../types";
import { useAccount } from "../../context/account-context";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onCreateWorkspaceClick: () => void;
  ownedCount: number;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onCreateWorkspaceClick,
  ownedCount,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAccount();

  const maxSlots = user?.flowgrid_plan?.max_workspaces ?? 3;
  const isLimitReached = ownedCount >= maxSlots;
  const currentPlan = user?.flowgrid_plan?.name || "Pro";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#E8ECF3] bg-white px-3 py-2 text-left text-xs transition-all hover:border-purple-300 hover:bg-purple-50/20 shadow-2xs"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#7651F5] font-bold border border-purple-200 font-heading">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="truncate">
            <div className="truncate font-heading font-bold text-xs text-[#0B1020]">
              {currentWorkspace ? currentWorkspace.name : "Select Workspace"}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
              <span className="font-semibold text-[#7651F5]">
                {currentWorkspace?.user_role || "OWNER"}
              </span>
              <span>•</span>
              <span className="font-mono">{currentWorkspace?.currency || "USD"}</span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-900">
          {/* Slots usage indicator */}
          <div className="mb-2.5 rounded-xl bg-purple-50/60 p-2.5 text-[11px] border border-purple-100">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>{currentPlan} Plan Workspaces</span>
              <span className="font-bold text-[#7651F5]">
                {ownedCount} / {maxSlots < 9999 ? maxSlots : "Unlimited"}
              </span>
            </div>
            {maxSlots < 9999 && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLimitReached ? "bg-amber-500" : "bg-[#7651F5]"
                  }`}
                  style={{ width: `${Math.min(100, (ownedCount / maxSlots) * 100)}%` }}
                />
              </div>
            )}
            {isLimitReached && maxSlots < 9999 && (
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-amber-700 font-medium">Slot limit reached</span>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-[#7651F5] hover:underline"
                >
                  Upgrade
                </Link>
              </div>
            )}
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">
            Your Businesses
          </div>

          {/* List of accessible workspaces */}
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-purple-50 font-bold text-[#7651F5]"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500">
                      <Building2 className="h-3 w-3" />
                    </div>
                    <div className="truncate">
                      <span className="truncate block font-medium">{ws.name}</span>
                      <span className="text-[9px] text-slate-400 block font-normal">
                        {ws.business_type || "Business"} • {ws.currency}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#7651F5] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 border-t border-slate-100 pt-2 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateWorkspaceClick();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-[#7651F5] hover:bg-purple-50 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>+ Create a Business</span>
            </button>

            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Personal Account & Plans</span>
              </div>
              <ArrowRight className="h-3 w-3 text-slate-400" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
