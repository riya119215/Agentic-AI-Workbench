import React from "react";
import { CheckCircle2, AlertCircle, Clock, Cpu, ArrowRight } from "lucide-react";
import { AgentStep } from "../lib/api";

interface ExecutionGraphProps {
  steps: AgentStep[];
  modelRouting?: {
    selected_model: string;
    task_type: string;
    rationale: string;
    backend: string;
  };
}

export const ExecutionGraph: React.FC<ExecutionGraphProps> = ({ steps, modelRouting }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 my-3 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Agentic Plan & State Machine Trail
          </h4>
        </div>
        {modelRouting && (
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 font-mono">Auto-Routed:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              {modelRouting.selected_model}
            </span>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60"
          >
            <div className="mt-0.5">
              {step.status === "COMPLETED" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : step.status === "ERROR" ? (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-200">
                  Step {step.step_num}: {step.title}
                </p>
                <span className="text-[10px] font-mono text-slate-500">
                  {step.model_used}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                {step.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
