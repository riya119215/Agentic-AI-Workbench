import React, { useState } from "react";
import {
  CheckCircle2,
  RotateCw,
  Clock,
  ChevronDown,
  ChevronRight,
  Code,
  Layers,
  Sparkles
} from "lucide-react";
import { ExecutionStep } from "../../lib/types";

interface AgentTimelineProps {
  steps: ExecutionStep[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps }) => {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleExpand = (stepNum: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  return (
    <div className="space-y-3 font-sans select-none">
      {steps.map((st) => {
        const isExpanded = expandedSteps.includes(st.step_num);
        const isCompleted = st.status === "COMPLETED";
        const isRunning = st.status === "RUNNING";

        return (
          <div
            key={st.step_num}
            className="p-3.5 rounded-xl bg-surface border border-subtle hover:border-border-strong transition-all shadow-2xs space-y-2"
          >
            {/* Step Header */}
            <div
              onClick={() => toggleExpand(st.step_num)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                ) : isRunning ? (
                  <RotateCw className="w-4 h-4 text-accent-azure animate-spin shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-text-muted shrink-0" />
                )}
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">
                    Step {st.step_num}: {st.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-snug mt-0.5">
                    {st.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-text-muted border border-subtle">
                  {st.model_used}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                )}
              </div>
            </div>

            {/* Expandable Raw Tool Input / Output */}
            {isExpanded && (
              <div className="pt-2 border-t border-subtle space-y-2 text-[11px] font-mono animate-in fade-in duration-150">
                {st.input_payload && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">
                      Input Payload:
                    </span>
                    <pre className="p-2.5 rounded-lg bg-canvas text-text-primary overflow-x-auto text-[10px] border border-subtle">
                      {st.input_payload}
                    </pre>
                  </div>
                )}
                {st.output_payload && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">
                      Tool Execution Output:
                    </span>
                    <pre className="p-2.5 rounded-lg bg-canvas text-text-primary overflow-x-auto text-[10px] border border-subtle">
                      {st.output_payload}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
