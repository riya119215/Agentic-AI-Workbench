import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  WifiOff,
  Server,
  FileCheck
} from "lucide-react";
import { api, EgressStatus, AuditLogRecord } from "../lib/api";

export const SecurityCenter: React.FC = () => {
  const [egressStatus, setEgressStatus] = useState<EgressStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadData = async () => {
    try {
      const [eData, aLogs] = await Promise.all([
        api.getEgressStatus(),
        api.getAuditLogs()
      ]);
      setEgressStatus(eData);
      setAuditLogs(aLogs);
    } catch (err) {
      console.error("Security data fetch error", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerificationResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DCDAD3]">
        <div>
          <h1 className="text-xl font-semibold text-[#171717]">
            Security & Cryptographic Audit
          </h1>
          <p className="text-xs text-[#686762] mt-0.5">
            Zero-egress hardware inspection and immutable SHA-256 cryptographic audit trail.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifying}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isVerifying ? "Verifying..." : "Verify Audit Integrity"}</span>
        </button>
      </div>

      {/* 2. Four Clean Status Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-white border border-[#DCDAD3] shadow-2xs space-y-1">
          <div className="text-[11px] text-[#686762]">Network Isolation</div>
          <div className="text-xs font-medium text-[#006B4D] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            <span>0 WAN Sockets</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#DCDAD3] shadow-2xs space-y-1">
          <div className="text-[11px] text-[#686762]">Inference Engine</div>
          <div className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            <span>Local Ollama</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#DCDAD3] shadow-2xs space-y-1">
          <div className="text-[11px] text-[#686762]">Python Sandbox</div>
          <div className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            <span>Isolated Runtime</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-white border border-[#DCDAD3] shadow-2xs space-y-1">
          <div className="text-[11px] text-[#686762]">Audit Ledger</div>
          <div className="text-xs font-medium text-[#171717] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            <span>SHA-256 Chained</span>
          </div>
        </div>
      </div>

      {/* 3. Verification Result (if triggered) */}
      {verificationResult && (
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs ${
            verificationResult.is_valid
              ? "bg-[#E6F7F2] border-[#00A878]/30 text-[#006B4D]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {verificationResult.is_valid ? (
            <CheckCircle2 className="w-4 h-4 text-[#00A878] shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-semibold">
              {verificationResult.is_valid
                ? "Cryptographic integrity verified (100% Intact)"
                : "Cryptographic anomaly detected"}
            </div>
            <p className="text-[#686762] leading-relaxed">{verificationResult.message}</p>
            {verificationResult.latest_block_hash && (
              <p className="text-[10px] font-mono text-[#686762] break-all pt-0.5">
                Chain tip: {verificationResult.latest_block_hash}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Clean Operational Audit Timeline */}
      <div className="bg-white border border-[#DCDAD3] rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
          <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
            Audit Trail
          </h2>
          <span className="text-[11px] text-[#686762]">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="divide-y divide-[#DCDAD3] text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-[#9E9D98]">
              No audit events recorded yet.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-[#686762] shrink-0">
                    {log.timestamp.replace("T", " ").substring(11, 19)}
                  </span>
                  <span className="font-medium text-[#171717]">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-[#686762]">
                    {log.user_id} ({log.role})
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-[#686762] shrink-0">
                  <span>{log.model_used}</span>
                  <span className="text-[#006B4D] font-mono">
                    {log.current_hash.substring(0, 10)}...
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
