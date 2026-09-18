import React from "react";
import { ShieldAlert, Check, X, Lock } from "lucide-react";
import { ApprovalItem } from "../lib/api";

interface ApprovalModalProps {
  request: ApprovalItem | null;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export function ApprovalModal({ request, onApprove, onReject, onClose }: ApprovalModalProps) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 bg-sovGraphite-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-sovBorder rounded-2xl max-w-lg w-full p-6 shadow-sov-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-sovBorder pb-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              ACTION REQUIRES HUMAN APPROVAL
            </span>
            <h3 className="text-base font-bold text-sovGraphite-950 mt-1">{request.title}</h3>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-sovWarm-50 border border-sovBorder rounded-xl p-4 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-sovGraphite-500">Request ID:</span>
            <span className="text-sovBlue-800 font-bold">{request.request_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sovGraphite-500">Action Type:</span>
            <span className="text-sovGraphite-900">{request.action_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sovGraphite-500">Security Clearance:</span>
            <span className="text-amber-800 font-bold">{request.classification}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sovGraphite-500">Requested By:</span>
            <span className="text-sovGraphite-900">{request.requested_by}</span>
          </div>
          <div className="pt-2 border-t border-sovBorder text-sovGraphite-700 font-sans leading-relaxed">
            {request.description}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => onReject(request.request_id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sovWarm-100 hover:bg-sovWarm-200 text-sovGraphite-700 font-medium text-xs transition border border-sovBorder"
          >
            <X className="w-4 h-4 text-red-600" />
            <span>Reject Action</span>
          </button>

          <button
            onClick={() => onApprove(request.request_id)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sov-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
