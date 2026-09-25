import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  ClipboardCheck,
  FileSpreadsheet,
  MessageSquare,
  Trash2,
  Clock,
  Award,
  Activity,
  Cpu,
  Lock,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { GlowingCommandBar } from "../command/GlowingCommandBar";
import { taskStorage, TaskSession } from "../../lib/taskStorage";

interface LandingViewProps {
  onSubmitPrompt: (prompt: string, attachments: string[], mode?: string) => void;
  onQuickAction: (actionType: "document" | "code" | "drawing" | "note") => void;
  onSelectSavedSession?: (session: TaskSession) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSubmitPrompt,
  onQuickAction,
  onSelectSavedSession,
}) => {
  const [recentSessions, setRecentSessions] = useState<TaskSession[]>([]);

  useEffect(() => {
    setRecentSessions(taskStorage.getSessions());
  }, []);

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    taskStorage.deleteSession(id);
    setRecentSessions(taskStorage.getSessions());
  };

  const formatSessionTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const quickActions = [
    {
      id: "document" as const,
      title: "Document Metrology & SOP Inspection",
      subtitle: "DIRECTIVE 01-A",
      desc: "Evaluate technical inspection reports and engineering data against approved SOPs",
      icon: FileText,
      badge: "SOP Verification",
    },
    {
      id: "code" as const,
      title: "Compliance Threshold Audit",
      subtitle: "DIRECTIVE 02-B",
      desc: "Audit vibration, pressure, and operational limits against national safety standards",
      icon: ClipboardCheck,
      badge: "Safety Limits",
    },
    {
      id: "drawing" as const,
      title: "Executive Intelligence Brief",
      subtitle: "DIRECTIVE 03-C",
      desc: "Synthesize complex multi-page operational logs into structured brief briefs",
      icon: FileSpreadsheet,
      badge: "Brief Generation",
    },
    {
      id: "note" as const,
      title: "Official Approval Note Sheet",
      subtitle: "DIRECTIVE 04-D",
      desc: "Compile official Approval Note Sheet (.docx) with cryptographic citations",
      icon: FileCheck,
      badge: "Official Note",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-[#F4F6F9] select-none font-sans overflow-y-auto relative">
      {/* Background Subtle Watermark / Pattern */}
      <div className="absolute inset-0 gov-card-pattern opacity-40 pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col items-center text-center space-y-6 my-auto relative z-10 py-6">
        {/* Sovereign Seal & Department Header */}
        <div className="flex flex-col items-center space-y-3">
          {/* Sovereign Emblem Badge */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#07111E] text-[#F59E0B] flex items-center justify-center border-2 border-[#D97706]/60 shadow-lg gov-seal-glow">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#D97706] text-white p-1 rounded-full text-[10px]">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#0B192C]/10 border border-[#0B192C]/20 text-[#0B192C] text-[11px] font-bold tracking-wider uppercase">
              <span>Sovereign Operational Intelligence System</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B192C] font-heading">
              Sovereign Command & Analysis Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] max-w-xl mx-auto leading-relaxed">
              Secure, zero-egress local operational workbench for technical document inspection, compliance verification, and cryptographic note generation.
            </p>
          </div>
        </div>

        {/* Operational System Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl bg-white border border-[#CBD5E1] rounded-xl p-3 shadow-card">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#1E3E62] flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Inference Node</p>
              <p className="text-xs font-extrabold text-[#0B192C]">Local LLM • On-Prem</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">WAN Egress</p>
              <p className="text-xs font-extrabold text-[#059669]">Zero Air-Gapped</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Audit Chain</p>
              <p className="text-xs font-extrabold text-[#D97706]">SHA-256 Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Compliance Rate</p>
              <p className="text-xs font-extrabold text-[#0F172A]">100% ISO-SEC</p>
            </div>
          </div>
        </div>

        {/* Secure Command Composer */}
        <div className="w-full text-left max-w-3xl">
          <GlowingCommandBar
            onSend={onSubmitPrompt}
            autoFocus={true}
          />
        </div>

        {/* 4 Official Directives Grid */}
        <div className="space-y-2 w-full max-w-3xl pt-2 text-left">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold text-[#0B192C] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              Official Operational Directives & Quick Modules
            </span>
            <span className="text-[10px] text-[#64748B] font-medium">Select a directive to launch pre-loaded analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => onQuickAction(action.id)}
                  className="p-3.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#D97706] hover:shadow-card-elevated transition-all text-left flex items-start gap-3.5 cursor-pointer group relative overflow-hidden"
                >
                  <div className="p-2.5 rounded-lg bg-[#0B192C] text-[#F59E0B] shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-[#D97706] uppercase tracking-wider">
                        {action.subtitle}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
                        {action.badge}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#0B192C] group-hover:text-[#D97706] transition-colors leading-tight">
                      {action.title}
                    </h3>

                    <p className="text-[11px] text-[#475569] leading-snug line-clamp-2">
                      {action.desc}
                    </p>
                  </div>

                  <div className="self-center">
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#D97706] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Analyses & Conversations */}
        {recentSessions.length > 0 && (
          <div className="w-full max-w-3xl space-y-2.5 pt-2 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold text-[#0B192C] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                Recent Command Sessions & Analysis Logs
              </span>
              <button
                type="button"
                onClick={() => {
                  taskStorage.clearAll();
                  setRecentSessions([]);
                }}
                className="text-[11px] font-semibold text-[#64748B] hover:text-[#DC2626] transition cursor-pointer"
              >
                Clear Audit History
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {recentSessions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSavedSession && onSelectSavedSession(s)}
                  className="p-3 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#1E3E62] hover:shadow-card transition flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-md bg-[#1E3E62]/10 text-[#1E3E62] flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0B192C] truncate group-hover:text-[#1E3E62] transition-colors">
                        {s.title || s.prompt || "Command Analysis Task"}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#64748B] mt-0.5 font-medium">
                        <span className="flex items-center gap-1 text-[#475569]">
                          <Clock className="w-2.5 h-2.5" />
                          {formatSessionTime(s.updatedAt || s.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{s.messages?.length || 0} exchanged logs</span>
                        {s.deliverables && s.deliverables.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#059669] font-bold">
                              {s.deliverables.length} official note sheet{s.deliverables.length > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="p-1.5 rounded-md hover:bg-[#FEE2E2] text-[#94A3B8] hover:text-[#DC2626] transition cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Purge session log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0B192C] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Government Footer Notice */}
      <footer className="w-full max-w-4xl pt-4 border-t border-[#CBD5E1] text-[11px] text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <span>Local On-Premise Execution</span>
          <span>•</span>
          <span>Air-Gapped Zero WAN Egress</span>
          <span>•</span>
          <span>Cryptographically Sealed SHA-256</span>
        </div>
        <div className="text-[10px] font-mono text-[#94A3B8]">
          SOV-SEC-STD-2026-V4 • RESTRICTED ACCESS
        </div>
      </footer>
    </div>
  );
};
