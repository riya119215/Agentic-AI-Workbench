import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, AlertTriangle, RefreshCw, CheckCircle2, Hash } from "lucide-react";
import { api, AuditLogRecord } from "../lib/api";

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const result = await api.verifyAuditChain();
      setVerificationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Verification Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Lock className="w-6 h-6 text-amber-400" />
            <span>Cryptographic Audit Trail (SHA-256 Hash Chained)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Every user request, model routing decision, tool execution, and generated deliverable is immutably hashed and chained.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start">
          <button
            onClick={fetchLogs}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </button>

          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{verifying ? "Hashing & Verifying..." : "Verify Cryptographic Integrity"}</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 ${
            verificationResult.is_valid
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          {verificationResult.is_valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
              {verificationResult.is_valid
                ? "TAMPER-EVIDENT INTEGRITY VERIFIED (PASS)"
                : "CRYPTOGRAPHIC ANOMALY / TAMPER DETECTED"}
            </h4>
            <p className="text-xs mt-1 leading-relaxed">
              {verificationResult.message}
            </p>
            {verificationResult.latest_block_hash && (
              <p className="text-[10px] font-mono mt-1 text-slate-400 truncate max-w-2xl">
                Latest Chain Tip Hash: {verificationResult.latest_block_hash}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-3">Log ID</th>
                <th className="py-3 px-3">Timestamp (UTC)</th>
                <th className="py-3 px-3">Officer / User</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Model Routed</th>
                <th className="py-3 px-3">Deliverables Touched</th>
                <th className="py-3 px-3 font-mono">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-blue-400 font-medium">
                      {log.log_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {log.timestamp.replace("T", " ").substring(0, 19)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-200">{log.user_id}</span>{" "}
                      <span className="text-[10px] text-slate-500">({log.role})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-indigo-300">
                      {log.model_used}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-[180px] truncate">
                      {Array.isArray(log.files_touched) && log.files_touched.length > 0
                        ? log.files_touched.join(", ")
                        : "None"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-400 truncate max-w-[120px]" title={log.current_hash}>
                      {log.current_hash.substring(0, 14)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
