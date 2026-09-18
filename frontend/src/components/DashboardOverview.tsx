import React from "react";
import { 
  Bot, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Layers, 
  Lock, 
  Radio, 
  Activity, 
  ArrowRight,
  FileCheck,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { UserProfile } from "../lib/api";

interface DashboardOverviewProps {
  currentUser: UserProfile | null;
  onNavigate: (tab: any) => void;
}

export function DashboardOverview({ currentUser, onNavigate }: DashboardOverviewProps) {
  const sampleActions = [
    {
      title: "Run Inspection Audit (SOP)",
      desc: "Process scanned PDF inspection against SOP-TURB-IND-2026-V4 and compile Note Sheet (.docx)",
      target: "chat",
      prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul."
    },
    {
      title: "Sensor Telemetry Anomaly Analytics",
      desc: "Execute Python anomaly detection in isolated sandbox and generate Excel + PNG plot",
      target: "chat",
      prompt: "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet."
    },
    {
      title: "Multi-Evidence Sovereign Master Task",
      desc: "Correlate PDF, CSV, and photos into full deliverable suite (.docx, .xlsx, .pptx)",
      target: "chat",
      prompt: "Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx)."
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0B1A3A] via-[#0D224D] to-[#08152E] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/50 text-[10px] font-mono font-bold tracking-widest uppercase">
                MISSION CONTROL • LOCAL NODE ACTIVE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50 text-[10px] font-mono font-bold">
                ZERO CLOUD EGRESS
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">
              SOVEREIGN AGENTIC AI WORKBENCH
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Air-gapped, zero-cloud autonomous operating system for Defence, Government ministries, and Strategic PSUs. Local models, multimodal RAG, isolated sandbox, and cryptographic audit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("chat")}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition"
            >
              <Bot className="w-4 h-4" />
              <span>Launch Agent Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core Pillar Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 text-center">
          <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <div className="text-[10px] font-mono text-slate-400 uppercase">LOCAL AI</div>
          <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">READY (100% Local)</div>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 text-center">
          <Database className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-[10px] font-mono text-slate-400 uppercase">KNOWLEDGE RAG</div>
          <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5">ACTIVE (ChromaDB)</div>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 text-center">
          <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-[10px] font-mono text-slate-400 uppercase">ZERO EGRESS</div>
          <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">0 WAN LEAKS</div>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 text-center">
          <Lock className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <div className="text-[10px] font-mono text-slate-400 uppercase">AUDIT LEDGER</div>
          <div className="text-xs font-bold text-purple-400 font-mono mt-0.5">SHA-256 INTACT</div>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 text-center">
          <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-[10px] font-mono text-slate-400 uppercase">RBAC CLEARANCE</div>
          <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">{currentUser?.clearance_level || "RESTRICTED"}</div>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3 text-center">
          <Layers className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <div className="text-[10px] font-mono text-slate-400 uppercase">CODE SANDBOX</div>
          <div className="text-xs font-bold text-cyan-400 font-mono mt-0.5">ISOLATED</div>
        </div>
      </div>

      {/* Flagship Demonstration Scenarios */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          SIH26117 Flagship Mission Scenarios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleActions.map((act, i) => (
            <div key={i} className="bg-[#060D1A] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition group">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  DEMO {i + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-2 group-hover:text-cyan-300 transition">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.desc}</p>
              </div>

              <button
                onClick={() => onNavigate("chat")}
                className="mt-4 flex items-center justify-between text-xs font-mono text-cyan-400 font-bold hover:text-cyan-300 pt-2 border-t border-slate-800/60"
              >
                <span>Execute Scenario</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
