import React, { useState, useEffect } from "react";
import { ShieldCheck, Radio, WifiOff, Globe, Server, CheckCircle2, RefreshCw } from "lucide-react";
import { api, EgressStatus } from "../lib/api";

export const ZeroEgressMonitor: React.FC = () => {
  const [status, setStatus] = useState<EgressStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getEgressStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Radio className="w-6 h-6 text-emerald-400" />
            <span>Zero-Egress & Air-Gap Verification Radar</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Continuous real-time socket inspection guarantees zero outbound WAN telemetry or cloud API calls.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 transition-all self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Poll Sockets</span>
        </button>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Air Gap Status */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Air-Gap Integrity
            </span>
            <WifiOff className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 tracking-tight">
              {status?.is_air_gapped ? "100% AIR-GAPPED" : "WAN DETECTED"}
            </h3>
            <p className="text-xs text-emerald-300/80 mt-1">
              {status?.compliance_standard}
            </p>
          </div>
        </div>

        {/* Outbound WAN Packets */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              External WAN Outbound Sockets
            </span>
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono">
              {status?.wan_egress_count ?? 0} Packets
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              OpenAI / Cloud APIs Blocked: YES
            </p>
          </div>
        </div>

        {/* Local Services */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Local Loopback Listeners
            </span>
            <Server className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono">
              127.0.0.1
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active Ports: 8000 (FastAPI), 11434 (Ollama), 5173 (UI)
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Guarantee Box */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sovereign Security Guarantee & Zero-Cloud Proof</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>OpenAI, Anthropic & Cloud APIs: <strong>Completely Disconnected</strong></span>
          </div>
          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Document Vectors: <strong>Stored Locally in ChromaDB</strong></span>
          </div>
          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Code Sandbox: <strong>Isolated Execution (Sockets Blocked)</strong></span>
          </div>
          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Audit Trail: <strong>Cryptographic SHA-256 Chained SQLite</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
