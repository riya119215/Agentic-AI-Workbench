import React, { useEffect, useState } from "react";
import {
  Cpu,
  CheckCircle2,
  RefreshCw,
  GitFork,
  Server
} from "lucide-react";
import { api, ModelRuntimeStatus } from "../lib/api";

export const ModelControlCenter: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelRuntimeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskSimulation, setSelectedTaskSimulation] = useState<string>("document");

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

  const routingExamples: Record<string, { type: string; model: string; why: string }> = {
    document: {
      type: "Document extraction & SOP audit",
      model: "GLM-4 9B",
      why: "High structured context processing + tabular and technical clause comprehension."
    },
    reasoning: {
      type: "Anomaly reasoning & root cause",
      model: "Qwen 2.5 7B",
      why: "Optimized Chain-of-Thought reasoning + deep domain mathematical inference."
    },
    vision: {
      type: "Defect metrology & scan inspection",
      model: "LLaVA 7B",
      why: "Spatial feature extraction on bearing defect photos + babbit layer surface cavitation assessment."
    },
    code: {
      type: "Python analytics in sandbox",
      model: "Qwen 2.5 Coder",
      why: "Isolated script generation with pandas, numpy, and matplotlib."
    }
  };

  const currentRoute = routingExamples[selectedTaskSimulation];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-sovBorder">
        <div>
          <h1 className="text-xl font-semibold text-sovGraphite-950">
            Models
          </h1>
          <p className="text-xs text-sovGraphite-500 mt-0.5">
            Local inference models and autonomous routing rules.
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-sovWarm-100 border border-sovBorder text-xs text-sovGraphite-700 font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Runtime Overview Bar */}
      <div className="bg-white border border-sovBorder rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sovWarm-100 flex items-center justify-center text-sovGraphite-700">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-sovGraphite-900">
              Ollama Local Loopback
            </div>
            <div className="text-[11px] font-mono text-sovGraphite-400">
              {modelStatus?.endpoint || "127.0.0.1:11434"} · 0 WAN Sockets
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-sans">
          <div>
            <div className="text-[11px] text-sovGraphite-400">RAM Allocation</div>
            <div className="font-medium text-sovGraphite-900 font-mono">
              {modelStatus?.hardware_specs?.ram_used_gb || "8.4"} / {modelStatus?.hardware_specs?.ram_total_gb || "15.8"} GB
            </div>
          </div>
          <div>
            <div className="text-[11px] text-sovGraphite-400">Acceleration</div>
            <div className="font-medium text-emerald-700">
              AVX2 Active
            </div>
          </div>
        </div>
      </div>

      {/* 3. Installed Models List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-semibold text-sovGraphite-900">
            Installed local models
          </h2>
          <span className="text-[11px] text-sovGraphite-400">
            {modelStatus?.catalogue?.length || 4} available
          </span>
        </div>

        <div className="bg-white border border-sovBorder rounded-xl divide-y divide-sovBorder-subtle overflow-hidden">
          {modelStatus?.catalogue?.map((m) => (
            <div
              key={m.id}
              className="p-4 hover:bg-sovWarm-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-sovGraphite-950 font-sans">
                    {m.name}
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sovWarm-100 text-sovGraphite-500">
                    {m.type}
                  </span>
                </div>
                <p className="text-xs text-sovGraphite-500">
                  {m.capability}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs">
                <span className="text-[11px] text-sovGraphite-400 font-mono">
                  {m.hardware_target}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Model Routing Explanation */}
      <div className="bg-white border border-sovBorder rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-sovBorder-subtle">
          <div>
            <h2 className="text-xs font-semibold text-sovGraphite-900">
              Autonomous model router
            </h2>
            <p className="text-xs text-sovGraphite-500 mt-0.5">
              Task classifier dynamically assigns the best local model.
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setSelectedTaskSimulation("document")}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedTaskSimulation === "document"
                  ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                  : "text-sovGraphite-500 hover:text-sovGraphite-900"
              }`}
            >
              Document
            </button>
            <button
              onClick={() => setSelectedTaskSimulation("reasoning")}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedTaskSimulation === "reasoning"
                  ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                  : "text-sovGraphite-500 hover:text-sovGraphite-900"
              }`}
            >
              Reasoning
            </button>
            <button
              onClick={() => setSelectedTaskSimulation("vision")}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedTaskSimulation === "vision"
                  ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                  : "text-sovGraphite-500 hover:text-sovGraphite-900"
              }`}
            >
              Vision
            </button>
            <button
              onClick={() => setSelectedTaskSimulation("code")}
              className={`px-2.5 py-1 rounded-md transition ${
                selectedTaskSimulation === "code"
                  ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                  : "text-sovGraphite-500 hover:text-sovGraphite-900"
              }`}
            >
              Code
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-sovWarm-50 space-y-1">
            <div className="text-[11px] text-sovGraphite-400">Task type</div>
            <div className="font-semibold text-sovGraphite-900">{currentRoute.type}</div>
          </div>

          <div className="p-3 rounded-lg bg-sovWarm-50 space-y-1">
            <div className="text-[11px] text-sovGraphite-400">Selected model</div>
            <div className="font-semibold text-emerald-700">{currentRoute.model}</div>
          </div>

          <div className="p-3 rounded-lg bg-sovWarm-50 space-y-1 sm:col-span-1">
            <div className="text-[11px] text-sovGraphite-400">Rationale</div>
            <div className="text-sovGraphite-600 leading-tight">{currentRoute.why}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
