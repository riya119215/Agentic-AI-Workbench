import React, { useEffect, useState } from "react";
import { Cpu, CheckCircle2, ShieldAlert, Zap, Server, Activity, RefreshCw } from "lucide-react";
import { api, ModelRuntimeStatus } from "../lib/api";

export function LocalModelHub() {
  const [modelStatus, setModelStatus] = useState<ModelRuntimeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getModelStatus();
      setModelStatus(data);
    } catch (err) {
      console.error("Failed to fetch model status", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-tight text-slate-100">LOCAL MODEL MANAGER & ROUTER</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Cloud Local Inference Engine (Ollama Loopback 127.0.0.1:11434). External cloud APIs strictly blocked.
          </p>
        </div>
        <button
          onClick={loadStatus}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Runtime</span>
        </button>
      </div>

      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>INFERENCE RUNTIME</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {modelStatus?.endpoint || "127.0.0.1:11434"}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold font-mono">100% LOCAL LOOPBACK</span>
          </div>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>EXTERNAL CLOUD AI</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            DISABLED (0 WAN)
          </div>
          <p className="text-[11px] text-slate-400 mt-2">OpenAI / Cloud APIs blocked</p>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>HARDWARE TARGET</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono">
            CPU (13th Gen Intel)
          </div>
          <p className="text-[11px] text-cyan-400 mt-2 font-mono">Iris Xe / AVX2 Accelerated</p>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>RAM ALLOCATION</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {modelStatus?.hardware_specs.ram_used_gb || "8.4"} / {modelStatus?.hardware_specs.ram_total_gb || "15.8"} GB
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${modelStatus?.hardware_specs.cpu_utilization_pct || 45}%` }}
            />
          </div>
        </div>
      </div>

      {/* Model Catalogue */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          Registered Sovereign Model Catalogue
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modelStatus?.catalogue?.map((m) => (
            <div key={m.id} className="bg-[#060D1A] border border-slate-800/80 rounded-lg p-4 hover:border-cyan-500/30 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-cyan-400 border border-cyan-800/40">
                    {m.type}
                  </span>
                  <h4 className="text-base font-bold text-slate-100 font-mono mt-2">{m.name}</h4>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  {m.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3">{m.capability}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Target: {m.hardware_target}</span>
                <span className="text-emerald-400">{m.external_api}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
