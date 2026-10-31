"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, PlusCircle, Check, Sparkles } from "lucide-react";
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#E8ECF3] bg-white px-3 py-2 text-left text-xs transition-all hover:border-purple-300 hover:bg-purple-50/20 shadow-2xs"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#7651F5] font-bold border border-purple-100 font-heading">
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
              <span>{currentWorkspace?.currency || "USD"}</span>
            </div>
          </div>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-[#E8ECF3] bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Slots usage indicator */}
          <div className="mb-2 rounded-xl bg-slate-50 p-2.5 text-[11px] border border-[#E8ECF3]">
            <div className="flex justify-between font-medium text-[#64748B]">
              <span>Workspaces Owned</span>
              <span className="font-bold text-[#7651F5]">
                {ownedCount} / {maxSlots}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all ${
                  ownedCount >= maxSlots ? "bg-amber-500" : "bg-purple-600"
                }`}
                style={{ width: `${(ownedCount / maxSlots) * 100}%` }}
              />
            </div>
          </div>

          {/* List of accessible workspaces */}
          <div className="max-h-48 space-y-1 overflow-y-auto">
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
                      : "text-[#0B1020] hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{ws.name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-[#64748B] uppercase">
                      {ws.user_role || "MEMBER"}
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#7651F5] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-[#E8ECF3] pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateWorkspaceClick();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-[#7651F5] hover:bg-purple-50 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
