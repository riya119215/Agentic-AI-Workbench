import React from "react";
import {
  LayoutDashboard,
  Bot,
  Database,
  Cpu,
  ShieldCheck,
  Activity,
  FileSpreadsheet,
  FileText,
  Presentation,
  Terminal,
  Radio,
  Lock,
  Layers
} from "lucide-react";

export type NavTab = "dashboard" | "chat" | "kb" | "models" | "deliverables" | "security" | "benchmarks" | "audit" | "egress";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount?: number;
}

export function Sidebar({ activeTab, onSelectTab, pendingApprovalsCount = 0 }: SidebarProps) {
  const navSections = [
    {
      group: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Mission Control", icon: LayoutDashboard },
        { id: "chat", label: "Agent Workspace", icon: Bot, badge: "PRIMARY" },
      ]
    },
    {
      group: "KNOWLEDGE & MODELS",
      items: [
        { id: "kb", label: "Knowledge Hub (RAG)", icon: Database },
        { id: "models", label: "Local Model Router", icon: Cpu },
      ]
    },
    {
      group: "DELIVERABLES & TOOLS",
      items: [
        { id: "deliverables", label: "Deliverables Suite", icon: Layers },
      ]
    },
    {
      group: "SECURITY & GOVERNANCE",
      items: [
        { id: "security", label: "Security Center", icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined },
        { id: "egress", label: "Zero-Egress Radar", icon: Radio },
        { id: "audit", label: "Cryptographic Ledger", icon: Lock },
      ]
    },
    {
      group: "SYSTEM TELEMETRY",
      items: [
        { id: "benchmarks", label: "Hardware & Profiler", icon: Activity },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#091222] border-r border-slate-800/80 flex flex-col flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-950/40">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">SOVEREIGN AI</h1>
          <p className="text-[10px] font-mono text-cyan-400 font-semibold tracking-widest">SIH26117 • NODE-01</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">
        {navSections.map((sec) => (
          <div key={sec.group}>
            <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider mb-1.5 uppercase font-mono">
              {sec.group}
            </p>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id as NavTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.badge === "PRIMARY" 
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-700/50" 
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Air-Gap Guarantee Pill */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060D1A]/60 m-2 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-emerald-400">STRICT AIR-GAP</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">0 WAN</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-tight">
          Application-level Zero Cloud Egress active.
        </p>
      </div>
    </aside>
  );
}
