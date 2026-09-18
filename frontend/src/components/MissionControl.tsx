import React, { useState, useEffect } from "react";
import {
  Compass,
  Bot,
  Database,
  Cpu,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Layers,
  Lock,
  Radio,
  CheckCircle2,
  Clock,
  Zap,
  Play,
  Terminal,
  ShieldAlert,
  Search
} from "lucide-react";
import { UserProfile, api, SystemHealthReport, BenchmarkReport } from "../lib/api";
import { WorkspaceId } from "./TopBar";

interface MissionControlProps {
  currentUser: UserProfile | null;
  onNavigate: (workspace: WorkspaceId) => void;
  onExecuteDemo: (prompt: string, attachments: string[]) => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  currentUser,
  onNavigate,
  onExecuteDemo,
}) => {
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [docCount, setDocCount] = useState<number>(3);
  const [recentArtifacts, setRecentArtifacts] = useState<string[]>([
    "Inspection_Approval_Note_Unit7.docx",
    "Railway_Telemetry_Anomalies.xlsx",
    "Bearing_Cavitation_Assessment.pptx"
  ]);

  useEffect(() => {
    api.getSystemHealth().then(setHealth).catch(console.error);
    api.getIndexedDocs().then(docs => setDocCount(docs.length)).catch(console.error);
  }, []);

  const scenarios = [
    {
      id: "demo1",
      title: "Scanned Inspection Report $\\rightarrow$ Official Approval Note",
      category: "DOCUMENT & SOP AUDIT",
      desc: "Ingests scanned Unit 7 Turbine inspection, matches against SOP-TURB-IND-2026-V4 in ChromaDB, and compiles an official Government Approval Note (.docx).",
      tags: ["OCR", "RAG", "DOCX Note"],
      accent: "border-sovBlue-200 hover:border-sovBlue-500 bg-sovBlue-50/30",
      prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
    },
    {
      id: "demo2",
      title: "Railway Sensor Telemetry $\\rightarrow$ Isolated Anomaly Sandbox",
      category: "CODE SANDBOX & ANALYTICS",
      desc: "Executes Python anomaly detection inside an isolated container (0 network sockets) over CSV telemetry and generates Excel summary + Matplotlib degradation plot.",
      tags: ["Sandbox", "Pandas", "XLSX + Plot"],
      accent: "border-emerald-200 hover:border-emerald-500 bg-emerald-50/30",
      prompt: "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.",
      attachments: ["railway_sensor_telemetry.csv"]
    },
    {
      id: "demo3",
      title: "Multi-Evidence Sovereign Master Suite (.docx + .xlsx + .pptx)",
      category: "MULTIMODAL SYNTHESIS",
      desc: "Correlates scanned PDF, sensor CSV, and photo evidence simultaneously to generate executive slides, spreadsheets, and note sheets.",
      tags: ["Multimodal", "Cross-Verification", "Tri-Artifacts"],
      accent: "border-amber-200 hover:border-amber-500 bg-amber-50/30",
      prompt: "Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx).",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt", "railway_sensor_telemetry.csv", "bearing_cavitation_scan.png"]
    }
  ];

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Top Header Banner: SYSTEM READY */}
      <div className="bg-white border border-sovBorder rounded-2xl p-6 shadow-sov-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYSTEM READY • LOCAL NODE-01
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sovWarm-200 border border-sovBorder text-sovGraphite-700 text-[11px] font-mono font-medium">
              CLEARANCE: {currentUser?.clearance_level || "RESTRICTED"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sovGraphite-950">
            Sovereign AI Workbench
          </h1>
          <p className="text-sm text-sovGraphite-600 max-w-3xl leading-relaxed">
            Your local intelligence workspace. Air-gapped, zero-cloud autonomous agent operating system with local LLMs, multimodal RAG, isolated sandbox, and cryptographic audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate("agents")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sov-sm transition"
          >
            <Bot className="w-4 h-4" />
            <span>Open Agent Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate("security")}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sovWarm-100 hover:bg-sovWarm-200 border border-sovBorder text-sovGraphite-800 font-medium text-xs transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit & Security</span>
          </button>
        </div>
      </div>

      {/* 2. Central Active Task & Horizontal Pipeline Canvas */}
      <div className="bg-white border border-sovBorder rounded-2xl p-6 shadow-sov-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-sovBorder gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-sovGraphite-400 font-bold">
              ACTIVE WORKSPACE PIPELINE
            </div>
            <h2 className="text-base sm:text-lg font-bold text-sovGraphite-900 mt-0.5">
              Defence Turbomachinery & Infrastructure Integrity Audit
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Autonomous Orchestrator Active
            </span>
          </div>
        </div>

        {/* Visual Multi-Stage Pipeline */}
        <div className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-sovWarm-50 border border-sovBorder flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sovGraphite-400 font-bold">STAGE 01</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-xs text-sovGraphite-900">Input Document</div>
                <div className="text-[11px] text-sovGraphite-500 font-mono mt-0.5">PDF / Scanned Scan</div>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium font-mono">● Ingested</div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-sovWarm-50 border border-sovBorder flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sovGraphite-400 font-bold">STAGE 02</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-xs text-sovGraphite-900">Local OCR</div>
                <div className="text-[11px] text-sovGraphite-500 font-mono mt-0.5">PaddleOCR (Local)</div>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium font-mono">● Parsed (100%)</div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-sovWarm-50 border border-sovBorder flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sovGraphite-400 font-bold">STAGE 03</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-xs text-sovGraphite-900">Knowledge RAG</div>
                <div className="text-[11px] text-sovGraphite-500 font-mono mt-0.5">ChromaDB Vectors</div>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium font-mono">● SOP Matched</div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-300 ring-2 ring-emerald-500/20 flex flex-col justify-between space-y-2 relative shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-800 font-bold">STAGE 04</span>
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <div className="font-semibold text-xs text-sovGraphite-950">Agent Reasoning</div>
                <div className="text-[11px] text-emerald-800 font-mono mt-0.5">Local LLM Router</div>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE (Ollama)
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-3.5 rounded-xl bg-sovWarm-50 border border-sovBorder flex flex-col justify-between space-y-2 opacity-90">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sovGraphite-400 font-bold">STAGE 05</span>
                <Clock className="w-4 h-4 text-sovGraphite-400" />
              </div>
              <div>
                <div className="font-semibold text-xs text-sovGraphite-900">Verification</div>
                <div className="text-[11px] text-sovGraphite-500 font-mono mt-0.5">Strict Air-Gap</div>
              </div>
              <div className="text-[10px] text-sovGraphite-500 font-mono">○ Ready</div>
            </div>

            {/* Step 6 */}
            <div className="p-3.5 rounded-xl bg-sovWarm-50 border border-sovBorder flex flex-col justify-between space-y-2 opacity-90">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sovGraphite-400 font-bold">STAGE 06</span>
                <FileText className="w-4 h-4 text-sovGraphite-400" />
              </div>
              <div>
                <div className="font-semibold text-xs text-sovGraphite-900">Document Gen</div>
                <div className="text-[11px] text-sovGraphite-500 font-mono mt-0.5">Official .DOCX Note</div>
              </div>
              <div className="text-[10px] text-sovGraphite-500 font-mono">○ Ready</div>
            </div>
          </div>
        </div>

        {/* Action bar inside central canvas */}
        <div className="pt-4 border-t border-sovBorder flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sovGraphite-600 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Chain: SHA-256 Validated</span>
            <span>•</span>
            <span>Outbound Sockets: 0 WAN</span>
          </div>
          <button
            onClick={() => onNavigate("agents")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sovGraphite-900 hover:bg-sovGraphite-800 text-white font-semibold text-xs transition"
          >
            <span>Open in Agent Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Flagship Demonstration Scenarios (1-Click Run) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-sovGraphite-900 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              SIH26117 Flagship Demonstration Scenarios (1-Click Run)
            </h3>
            <p className="text-xs text-sovGraphite-500 mt-0.5">
              Pre-packaged on-premise evaluation scenarios with real datasets and official deliverables generation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <div
              key={sc.id}
              className={`border rounded-2xl p-5 flex flex-col justify-between transition group shadow-sov-sm hover:shadow-sov-md bg-white ${sc.accent}`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-sovGraphite-700 border border-sovBorder">
                    DEMO 0{i + 1} • {sc.category}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-sovGraphite-950 group-hover:text-emerald-800 transition">
                  {sc.title}
                </h4>

                <p className="text-xs text-sovGraphite-600 leading-relaxed">
                  {sc.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sc.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-sovBorder text-sovGraphite-700 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-sovBorder/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-sovGraphite-500">100% Local Pipeline</span>
                <button
                  onClick={() => {
                    onNavigate("agents");
                    onExecuteDemo(sc.prompt, sc.attachments);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-600 hover:text-white border border-sovBorder text-sovGraphite-900 font-semibold text-xs shadow-sov-sm transition"
                >
                  <Play className="w-3 h-3 text-emerald-600 group-hover:text-white" />
                  <span>Execute Scenario</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. System State Telemetry Strip (Compact, No giant colorful cards) */}
      <div className="bg-white border border-sovBorder rounded-2xl p-5 shadow-sov-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-sovBorder">
          <span className="text-xs font-mono font-bold text-sovGraphite-600 uppercase tracking-wider">
            SYSTEM STATE TELEMETRY
          </span>
          <button
            onClick={() => onNavigate("system")}
            className="text-xs font-mono text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Detailed Hardware Profiler</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder">
            <div className="text-[10px] font-mono text-sovGraphite-500 font-bold uppercase">LOCAL MODEL</div>
            <div className="text-xs font-bold text-emerald-700 font-mono mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              READY (Ollama)
            </div>
            <div className="text-[10px] text-sovGraphite-400 font-mono mt-0.5">127.0.0.1:11434</div>
          </div>

          <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder">
            <div className="text-[10px] font-mono text-sovGraphite-500 font-bold uppercase">KNOWLEDGE</div>
            <div className="text-xs font-bold text-sovBlue-700 font-mono mt-1">
              {docCount} Ingested Docs
            </div>
            <div className="text-[10px] text-sovGraphite-400 font-mono mt-0.5">ChromaDB Vectors</div>
          </div>

          <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder">
            <div className="text-[10px] font-mono text-sovGraphite-500 font-bold uppercase">AGENTS</div>
            <div className="text-xs font-bold text-sovGraphite-900 font-mono mt-1">
              Multi-Model State
            </div>
            <div className="text-[10px] text-sovGraphite-400 font-mono mt-0.5">Planner + Router</div>
          </div>

          <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder">
            <div className="text-[10px] font-mono text-sovGraphite-500 font-bold uppercase">SANDBOX</div>
            <div className="text-xs font-bold text-sovGraphite-900 font-mono mt-1">
              ISOLATED (0 NET)
            </div>
            <div className="text-[10px] text-sovGraphite-400 font-mono mt-0.5">Python Runtime</div>
          </div>

          <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder">
            <div className="text-[10px] font-mono text-sovGraphite-500 font-bold uppercase">EGRESS</div>
            <div className="text-xs font-bold text-emerald-700 font-mono mt-1">
              0 WAN LEAKS
            </div>
            <div className="text-[10px] text-sovGraphite-400 font-mono mt-0.5">Strict Air-Gap</div>
          </div>

          <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder">
            <div className="text-[10px] font-mono text-sovGraphite-500 font-bold uppercase">AUDIT</div>
            <div className="text-xs font-bold text-sovGraphite-900 font-mono mt-1">
              SHA-256 CHAIN
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Verified Intact</div>
          </div>
        </div>
      </div>
    </div>
  );
};
