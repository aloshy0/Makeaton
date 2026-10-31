"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ApprovalRequest } from "../../types";
import { DUMMY_APPROVAL_REQUESTS } from "../../lib/dummy-data";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New demo request form
  const [actionType, setActionType] = useState("EARLY_CANCEL_SUBSCRIPTION");
  const [entityId, setEntityId] = useState("sub-001");
  const [reason, setReason] = useState(
    "Customer requested early contract termination due to consolidation"
  );

  const { data: approvals = DUMMY_APPROVAL_REQUESTS } = useQuery<ApprovalRequest[]>({
    queryKey: ["approvals"],
    queryFn: () => api.getApprovalRequests(),
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    try {
      await api.reviewApprovalRequest(
        "aac3abe7-18b7-4c5f-a29e-786b63476459",
        selectedApproval.id,
        reviewAction,
        rejectionReason
      );
      alert(`Approval request ${reviewAction}D successfully.`);
      setSelectedApproval(null);
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    } catch (err: any) {
      alert(err.message || "Review failed");
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createApprovalRequest("aac3abe7-18b7-4c5f-a29e-786b63476459", {
        action_type: actionType,
        entity_type: "subscription",
        entity_id: entityId,
        payload: { reason },
      });
      alert("Approval request submitted for Admin review.");
      setIsNewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    } catch (err: any) {
      alert(err.message || "Failed to create request");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Operational Approvals</h1>
          <p className="text-xs text-slate-500">
            Review and authorize sensitive operations requested by workspace staff members.
          </p>
        </div>
        <Button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Plus className="h-3.5 w-3.5" /> Submit Operational Request
        </Button>
      </div>

      {/* Approvals Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3.5">Action Type</th>
              <th className="px-5 py-3.5">Target Entity</th>
              <th className="px-5 py-3.5">Requested By</th>
              <th className="px-5 py-3.5">Requested At</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {approvals.map((appr: ApprovalRequest) => (
              <tr key={appr.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>{appr.action_type.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  <span className="font-medium capitalize">{appr.entity_type}</span>:{" "}
                  <span className="font-mono text-slate-500">{appr.entity_id}</span>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {appr.requested_by_email || "steve.staff@brightloop.com"}
                </td>
                <td className="px-5 py-4 text-slate-500">
                  {new Date(appr.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      appr.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : appr.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {appr.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {appr.status === "PENDING" ? (
                    <Button
                      size="sm"
                      onClick={() => setSelectedApproval(appr)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 gap-1 shadow-sm"
                    >
                      <ClipboardCheck className="h-3 w-3" /> Review Request
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Decision Recorded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Review Operational Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              Decide whether to authorize or reject this staff operation
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs text-slate-700 mb-4">
              <div>
                <strong>Operation:</strong> {selectedApproval.action_type}
              </div>
              <div>
                <strong>Requested by:</strong>{" "}
                {selectedApproval.requested_by_email || "Staff Member"}
              </div>
              <div>
                <strong>Justification:</strong>{" "}
                {selectedApproval.payload?.reason || "Operational necessity"}
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction("APPROVE")}
                    className={`rounded-lg border p-2 text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      reviewAction === "APPROVE"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve & Execute
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction("REJECT")}
                    className={`rounded-lg border p-2 text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      reviewAction === "REJECT"
                        ? "border-rose-600 bg-rose-50 text-rose-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <XCircle className="h-4 w-4" /> Reject Request
                  </button>
                </div>
              </div>

              {reviewAction === "REJECT" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rejection Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide justification for rejection"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedApproval(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Submit Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Submit Operational Approval Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Restricted staff action requiring Admin or Owner authorization
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operation Type
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="EARLY_CANCEL_SUBSCRIPTION">
                    Early Subscription Cancellation (Restricted Plan)
                  </option>
                  <option value="REFUND_PAYMENT">Customer Payment Refund</option>
                  <option value="HIGH_VALUE_DISCOUNT">
                    Authorize High-Value Discount (&gt;20%)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Entity ID
                </label>
                <input
                  type="text"
                  required
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  Submit for Admin Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
