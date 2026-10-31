"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, PlusCircle, Check, ShieldCheck, UserCheck } from "lucide-react";
import { Workspace } from "../../types";

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
  const maxSlots = 5;
  const remainingSlots = Math.max(0, maxSlots - ownedCount);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-left text-xs transition-colors hover:border-slate-700 hover:bg-slate-800/80"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-indigo-600/30 text-indigo-400 font-bold border border-indigo-500/30">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="truncate">
            <div className="truncate font-semibold text-slate-200">
              {currentWorkspace ? currentWorkspace.name : "Select Workspace"}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="inline-flex items-center text-indigo-400 font-medium">
                {currentWorkspace?.user_role || "MEMBER"}
              </span>
              <span>•</span>
              <span>{currentWorkspace?.currency || "USD"}</span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl backdrop-blur-md">
          {/* Slots usage indicator */}
          <div className="mb-2 rounded-lg bg-slate-900/60 p-2 text-[11px] border border-slate-800/80">
            <div className="flex justify-between font-medium text-slate-300">
              <span>Owned Business Workspaces</span>
              <span className="font-bold text-indigo-400">
                {ownedCount} / {maxSlots}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  ownedCount >= maxSlots ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${(ownedCount / maxSlots) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              {remainingSlots > 0
                ? `${remainingSlots} slot${remainingSlots > 1 ? "s" : ""} available to create`
                : "Maximum 5 workspace limit reached"}
            </div>
          </div>

          <div className="max-h-48 space-y-1 overflow-y-auto py-1">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Your Workspaces
            </div>
            {workspaces.map((ws) => {
              const isSelected = currentWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate">{ws.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Role: {ws.user_role || "Member"}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-slate-800/80 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateWorkspaceClick();
              }}
              disabled={ownedCount >= maxSlots}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                ownedCount >= maxSlots
                  ? "cursor-not-allowed text-slate-600 bg-slate-900/40"
                  : "text-indigo-400 hover:bg-indigo-950/40 hover:text-indigo-300"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create New Business ({remainingSlots} left)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
