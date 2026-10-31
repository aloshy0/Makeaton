"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
  ChevronDown,
  PlusCircle,
  Check,
  ExternalLink,
  User,
  Settings,
  Sparkles,
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
  const { switchContext } = useAccount();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const maxSlots = 5;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
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
        <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-[#E8ECF3] bg-white p-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Slots indicator */}
          <div className="mb-2.5 rounded-xl bg-slate-50 p-2.5 text-[11px] border border-[#E8ECF3]">
            <div className="flex justify-between font-semibold text-[#64748B]">
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

          {/* Section: Business Workspaces */}
          <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Business Workspaces</span>
            <span>{workspaces.length}</span>
          </div>

          {/* List of accessible workspaces */}
          <div className="max-h-48 space-y-1 overflow-y-auto no-scrollbar">
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
                      ? "bg-purple-50 font-bold text-[#7651F5] border border-purple-200"
                      : "text-[#0B1020] hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="h-6 w-6 rounded-md bg-purple-100 text-[#7651F5] flex items-center justify-center font-bold text-[10px] shrink-0">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="truncate text-xs font-semibold">{ws.name}</div>
                      <div className="text-[10px] text-[#64748B]">
                        {ws.slug || "flowgrid.cloud"} • {ws.user_role || "MEMBER"}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#7651F5] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[#E8ECF3] space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onCreateWorkspaceClick();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-bold text-[#7651F5] hover:bg-purple-50 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create New Workspace</span>
            </button>

            {/* Personal Customer Switch Link (Ref Image 2) */}
            <button
              onClick={() => {
                setIsOpen(false);
                switchContext("PERSONAL");
              }}
              className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Personal Customer Portal</span>
              </div>
              <ExternalLink className="h-3 w-3 text-emerald-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
