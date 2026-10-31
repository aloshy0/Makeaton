"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Eye,
  X,
  FileCode,
  Clock,
  User,
} from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { AuditLog } from "../../types";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["auditLogs"],
    queryFn: () => api.getAuditLogs(),
  });

  const filteredLogs = logs.filter((log: AuditLog) => {
    const matchesSearch =
      !searchTerm ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction =
      actionFilter === "ALL" || log.action.toUpperCase().includes(actionFilter.toUpperCase());

    return matchesSearch && matchesAction;
  });

  const getActionBadgeVariant = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE") || act.includes("INSERT")) return "confirmed";
    if (act.includes("APPROV") || act.includes("SUCCESS")) return "active";
    if (act.includes("UPDATE") || act.includes("EDIT")) return "draft";
    if (act.includes("DELETE") || act.includes("REJECT") || act.includes("CANCEL")) return "closed";
    if (act.includes("PAYMENT")) return "active";
    return "default";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Audit Trail & Governance Logs
            </h1>
            <span className="rounded-full bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5">
              Append-Only
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically sealed activity log of every business mutation, payment record, and
            role change.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>SOC2 / ISO 27001 Ready</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, action, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "CREATE", "UPDATE", "PAYMENT", "BILLING", "APPROVAL"].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                actionFilter === act
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {act === "ALL" ? "All Activity" : act}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading audit trail...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <History className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              No audit records match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Actor</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Entity</th>
                    <th className="px-5 py-3.5">Entity ID</th>
                    <th className="px-5 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="font-medium text-slate-900">
                            {log.user_email || "System Service"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{log.entity_type}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                        {log.entity_id}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-indigo-600 group-hover:bg-indigo-50"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-slate-900">Audit Record Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Actor
                  </span>
                  <span className="font-medium text-slate-900">
                    {selectedLog.user_email || "System Autonomous Task"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Timestamp
                  </span>
                  <span className="font-mono text-slate-900">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Action
                  </span>
                  <span className="font-mono font-semibold text-indigo-600">
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] block">
                    Entity
                  </span>
                  <span className="font-medium text-slate-900">
                    {selectedLog.entity_type} ({selectedLog.entity_id})
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-2">
                  Mutation Payload & Context
                </span>
                <pre className="rounded-lg bg-slate-950 p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedLog.payload || {}, null, 2)}
                </pre>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Tamper Seal:</span> This record is
                verified by Brightloop cryptographically signed log stream. Alterations are rejected
                at the database level.
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-3 bg-slate-50">
              <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
