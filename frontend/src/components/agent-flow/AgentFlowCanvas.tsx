import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Sparkles,
  Wrench,
  FileCheck,
  Layers,
  CheckCircle2,
  RotateCw,
  Clock,
  ArrowRight
} from "lucide-react";
import { AgentFlowNode } from "../../lib/types";

interface AgentFlowCanvasProps {
  activeStepIndex?: number;
  nodes?: AgentFlowNode[];
}

export const defaultAgentNodes: AgentFlowNode[] = [
  { id: "agent", label: "AI Orchestrator", type: "agent", status: "completed", detail: "Query classified & security verified" },
  { id: "router", label: "Model Router", type: "router", status: "completed", detail: "Routed to llama3.2 & bge-m3" },
  { id: "tool", label: "Tool Call (OCR & RAG)", type: "tool", status: "active", detail: "Extracted 24.5 KB text & SOP chunks" },
  { id: "output", label: "Deterministic Verification", type: "output", status: "pending", detail: "Rule-based threshold validation" },
  { id: "deliverable", label: "Deliverable (.docx)", type: "deliverable", status: "pending", detail: "Official Approval Note compilation" },
];

export const AgentFlowCanvas: React.FC<AgentFlowCanvasProps> = ({
  activeStepIndex = 2,
  nodes = defaultAgentNodes
}) => {
  const getNodeIcon = (type: string, status: string) => {
    switch (type) {
      case "agent":
        return <Sparkles className="w-4 h-4 text-accent-azure" />;
      case "router":
        return <Cpu className="w-4 h-4 text-accent-violet" />;
      case "tool":
        return <Wrench className="w-4 h-4 text-accent-emerald" />;
      case "output":
        return <FileCheck className="w-4 h-4 text-amber-400" />;
      case "deliverable":
        return <Layers className="w-4 h-4 text-accent-azure" />;
      default:
        return <Sparkles className="w-4 h-4 text-text-primary" />;
    }
  };

  return (
    <div className="w-full h-full bg-surface/60 rounded-2xl border border-subtle p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md select-none shadow-card-elevated">
      {/* Background Ambient Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:22px_22px] opacity-25 pointer-events-none" />

      {/* Subtle Ambient Light Bloom */}
      <div className="ambient-bloom-subtle top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
            Agent Execution Graph & Transparency Canvas
          </h4>
        </div>
        <span className="text-[10px] font-mono text-text-muted px-2.5 py-0.5 rounded-full bg-surface border border-subtle">
          Zero-Blackbox Runtime
        </span>
      </div>

      {/* Node Graph Visualization */}
      <div className="my-auto py-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 w-full">
        {nodes.map((node, index) => {
          const isActive = index === activeStepIndex || node.status === "active";
          const isCompleted = index < activeStepIndex || node.status === "completed";
          const isPending = index > activeStepIndex && node.status === "pending";

          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                title={`${node.label}: ${node.detail || ""}`}
                className={`relative flex flex-col p-3 rounded-xl border transition-all duration-300 flex-1 min-w-[130px] max-w-[185px] w-full ${
                  isActive
                    ? "bg-surface border-accent-azure ring-2 ring-accent-azure/50 shadow-glow-md scale-[1.03]"
                    : isCompleted
                    ? "bg-surface border-subtle shadow-2xs hover:border-accent-emerald/40 hover:-translate-y-0.5"
                    : "bg-surface/40 border-subtle/60 opacity-50 hover:opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-lg border ${
                    isActive ? "bg-accent-azure/10 border-accent-azure/30" : isCompleted ? "bg-accent-emerald/10 border-accent-emerald/20" : "bg-surface-elevated border-subtle"
                  }`}>
                    {getNodeIcon(node.type, node.status)}
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  ) : isActive ? (
                    <RotateCw className="w-4 h-4 text-accent-azure animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-text-muted/60" />
                  )}
                </div>

                <p className="text-xs font-semibold text-text-primary truncate" title={node.label}>
                  {node.label}
                </p>
                {node.detail && (
                  <p className="text-[10px] text-text-secondary mt-0.5 leading-snug line-clamp-2 font-mono" title={node.detail}>
                    {node.detail}
                  </p>
                )}

                {isActive && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold bg-accent-azure text-white shadow-glow-sm uppercase">
                    ACTIVE
                  </span>
                )}
              </motion.div>

              {/* Animated Connector Arrow / Line with Traveling Light Pulse */}
              {index < nodes.length - 1 && (
                <div className="hidden md:flex flex-col items-center justify-center shrink-0 px-1">
                  <div className="relative w-8 h-[2px] bg-subtle/80 rounded-full overflow-hidden">
                    {isCompleted && (
                      <div className="absolute inset-0 bg-accent-emerald/80" />
                    )}
                    {isActive && (
                      <motion.div
                        className="w-4 h-full bg-gradient-to-r from-transparent via-accent-azure to-white shadow-glow-sm"
                        animate={{ x: [-15, 35] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  <ArrowRight className={`w-3 h-3 -ml-0.5 mt-0.5 ${isCompleted ? "text-accent-emerald" : isActive ? "text-accent-azure animate-pulse" : "text-text-muted/40"}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="pt-3 border-t border-subtle flex flex-wrap items-center justify-between text-[11px] text-text-muted font-mono relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-emerald" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-azure animate-pulse" /> Active Node
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-text-muted/40" /> Pending
          </span>
        </div>
        <span className="text-[10px] text-text-secondary">100% Deterministic Local Flow</span>
      </div>
    </div>
  );
};
