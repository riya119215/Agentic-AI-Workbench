import React, { useState } from "react";
import {
  Play,
  RotateCw,
  FileText,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  Terminal,
  UserCheck,
  CheckCircle2
} from "lucide-react";

interface WorkflowBuilderProps {
  onNavigateToAgent: (prompt: string, attachments: string[]) => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onNavigateToAgent }) => {
  const [selectedPreset, setSelectedPreset] = useState<"emergency" | "telemetry" | "multimodal">("emergency");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(0);

  const workflows = {
    emergency: {
      name: "Emergency Overhaul Note Workflow",
      desc: "SOP compliance validation and Government Approval Note compilation.",
      prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"],
      nodes: [
        { id: "node_1", label: "Input", type: "Document", icon: FileText, details: "Scanned Unit 7 turbine report (PDF/TXT)" },
        { id: "node_2", label: "OCR", type: "Extraction", icon: Layers, details: "PaddleOCR local text & numbers" },
        { id: "node_3", label: "Knowledge", type: "Retrieval", icon: Database, details: "Matches against SOP-TURB-IND-2026-V4" },
        { id: "node_4", label: "Agent", type: "Inference", icon: Cpu, details: "Qwen 2.5 7B local reasoning" },
        { id: "node_5", label: "Verify", type: "Governance", icon: UserCheck, details: "Commanding Officer approval gate" },
        { id: "node_6", label: "Export", type: "Deliverable", icon: FileText, details: "Official Government Note Sheet (.docx)" }
      ]
    },
    telemetry: {
      name: "Railway Telemetry Anomaly Workflow",
      desc: "Rolling-average calculation, threshold breach detection, and spreadsheet export.",
      prompt: "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.",
      attachments: ["railway_sensor_telemetry.csv"],
      nodes: [
        { id: "node_1", label: "Input", type: "Data feed", icon: FileSpreadsheet, details: "railway_sensor_telemetry.csv stream" },
        { id: "node_2", label: "Sandbox", type: "Runtime", icon: Terminal, details: "Python 3.11 with 0 WAN sockets" },
        { id: "node_3", label: "Analytics", type: "Computation", icon: Cpu, details: "Z-score statistical anomaly detection" },
        { id: "node_4", label: "Export", type: "Deliverable", icon: FileSpreadsheet, details: "Railway_Telemetry_Anomalies.xlsx" }
      ]
    },
    multimodal: {
      name: "Multi-Evidence Synthesis Workflow",
      desc: "Joint synthesis across PDF reports, CSV feeds, and defect images.",
      prompt: "Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx).",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt", "railway_sensor_telemetry.csv", "bearing_cavitation_scan.png"],
      nodes: [
        { id: "node_1", label: "Input", type: "Multi-Source", icon: Layers, details: "PDF report + CSV telemetry + PNG scan" },
        { id: "node_2", label: "Knowledge", type: "Retrieval", icon: Database, details: "Joint vector embedding match" },
        { id: "node_3", label: "Agent", type: "Multimodal", icon: Cpu, details: "LLaVA + Qwen local inference" },
        { id: "node_4", label: "Verify", type: "Security", icon: CheckCircle2, details: "SHA-256 block ledger registration" },
        { id: "node_5", label: "Export", type: "Deliverable", icon: FileText, details: "DOCX + XLSX + PPTX generation" }
      ]
    }
  };

  const currentWf = workflows[selectedPreset];

  const handleRunWorkflow = () => {
    setIsExecuting(true);
    setActiveStep(0);

    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < currentWf.nodes.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setIsExecuting(false);
          return prev;
        }
      });
    }, 450);
  };

  const selectedNode = currentWf.nodes[selectedNodeIndex] || currentWf.nodes[0];

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sovBorder">
        <div>
          <h1 className="text-xl font-semibold text-sovGraphite-950">
            Workflows
          </h1>
          <p className="text-xs text-sovGraphite-500 mt-0.5">
            Visual multi-agent DAG pipelines and execution tracing.
          </p>
        </div>

        {/* Preset Switcher & Action */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setSelectedPreset("emergency");
              setActiveStep(-1);
              setSelectedNodeIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedPreset === "emergency"
                ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                : "text-sovGraphite-500 hover:text-sovGraphite-900 hover:bg-sovWarm-100"
            }`}
          >
            Emergency overhaul
          </button>
          <button
            onClick={() => {
              setSelectedPreset("telemetry");
              setActiveStep(-1);
              setSelectedNodeIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedPreset === "telemetry"
                ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                : "text-sovGraphite-500 hover:text-sovGraphite-900 hover:bg-sovWarm-100"
            }`}
          >
            Telemetry anomaly
          </button>
          <button
            onClick={() => {
              setSelectedPreset("multimodal");
              setActiveStep(-1);
              setSelectedNodeIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedPreset === "multimodal"
                ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                : "text-sovGraphite-500 hover:text-sovGraphite-900 hover:bg-sovWarm-100"
            }`}
          >
            Multi-evidence
          </button>
          <button
            onClick={handleRunWorkflow}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white font-medium text-xs transition"
          >
            {isExecuting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Trace</span>
          </button>
        </div>
      </div>

      {/* 2. Visual DAG Canvas (8 cols) + Node Settings (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Canvas */}
        <div className="lg:col-span-8 bg-white border border-sovBorder rounded-xl p-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle">
              <div>
                <h2 className="text-xs font-semibold text-sovGraphite-900">
                  {currentWf.name}
                </h2>
                <p className="text-xs text-sovGraphite-500 mt-0.5">{currentWf.desc}</p>
              </div>
              <span className="text-[11px] text-sovGraphite-400 font-mono">
                {currentWf.nodes.length} Nodes in DAG
              </span>
            </div>

            {/* Subtle Grid Canvas Area with Connected Nodes */}
            <div className="p-6 rounded-lg bg-sovWarm-100/60 min-h-[320px] flex items-center justify-center overflow-x-auto">
              <div className="flex items-center gap-3">
                {currentWf.nodes.map((node, i) => {
                  const Icon = node.icon;
                  const isCurrentActive = activeStep === i;
                  const isStepCompleted = activeStep > i;
                  const isNodeSelected = selectedNodeIndex === i;

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => setSelectedNodeIndex(i)}
                        className={`p-3.5 rounded-xl border bg-white cursor-pointer transition flex flex-col items-center justify-center text-center space-y-1.5 min-w-[100px] ${
                          isNodeSelected
                            ? "border-sovGraphite-900 shadow-2xs"
                            : isCurrentActive
                            ? "border-emerald-600 ring-2 ring-emerald-500/20"
                            : isStepCompleted
                            ? "border-sovBorder"
                            : "border-sovBorder opacity-80"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                            isStepCompleted
                              ? "bg-emerald-50 text-emerald-700"
                              : isCurrentActive
                              ? "bg-emerald-600 text-white animate-pulse"
                              : "bg-sovWarm-100 text-sovGraphite-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="font-semibold text-xs text-sovGraphite-900">
                          {node.label}
                        </div>
                        <div className="text-[10px] text-sovGraphite-400">
                          {node.type}
                        </div>
                      </div>

                      {i < currentWf.nodes.length - 1 && (
                        <div className="w-6 h-0.5 bg-sovBorder-strong shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-sovBorder-subtle flex items-center justify-between text-xs">
            <span className="text-sovGraphite-400 text-[11px]">
              Local DAG Execution Engine
            </span>
            <button
              onClick={() => onNavigateToAgent(currentWf.prompt, currentWf.attachments)}
              className="flex items-center gap-1.5 text-xs text-sovGraphite-900 font-medium hover:text-emerald-700 transition"
            >
              <span>Execute in Agent Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Node Settings Panel */}
        <div className="lg:col-span-4 bg-white border border-sovBorder rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-2 border-b border-sovBorder-subtle">
              <h2 className="text-xs font-semibold text-sovGraphite-900">
                Node settings
              </h2>
              <p className="text-[11px] text-sovGraphite-400 mt-0.5">
                Parameters for {selectedNode.label}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-sovGraphite-500">Node Title</label>
                <div className="font-medium text-sovGraphite-900 p-2.5 rounded-lg bg-sovWarm-50">
                  {selectedNode.label}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-sovGraphite-500">Type</label>
                <div className="text-sovGraphite-700 p-2.5 rounded-lg bg-sovWarm-50">
                  {selectedNode.type}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-sovGraphite-500">Description</label>
                <div className="text-sovGraphite-600 p-2.5 rounded-lg bg-sovWarm-50 leading-relaxed">
                  {selectedNode.details}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-sovBorder-subtle">
            <button
              onClick={() => onNavigateToAgent(currentWf.prompt, currentWf.attachments)}
              className="w-full py-2 rounded-lg bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white text-xs font-medium transition"
            >
              Launch workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
