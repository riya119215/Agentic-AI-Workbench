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
  Clock
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
      title: "Analyze Document",
      desc: "Evaluate inspection metrology against maintenance SOPs & safety standards",
      icon: FileText,
    },
    {
      id: "code" as const, // maps to compliance verification
      title: "Verify Compliance",
      desc: "Verify vibration, pressure, and temperature thresholds against engineering limits",
      icon: ClipboardCheck,
    },
    {
      id: "drawing" as const, // maps to document summarization
      title: "Summarize",
      desc: "Generate concise executive summaries from lengthy technical manuals and reports",
      icon: FileSpreadsheet,
    },
    {
      id: "note" as const, // maps to official report generation
      title: "Generate Report",
      desc: "Compile official Government Approval Note Sheets (.docx) with verified citations",
      icon: FileCheck,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F7F6F2] select-none font-sans overflow-y-auto">
      <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-6 my-auto">
        {/* Simple AI Assistant Hero */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            What can I help you with?
          </h1>
          <p className="text-xs sm:text-sm text-[#686762] max-w-lg mx-auto leading-relaxed">
            Analyze documents, inspect evidence, verify findings and generate trusted reports locally.
          </p>
        </div>

        {/* Clean Enterprise Composer */}
        <div className="w-full text-left">
          <GlowingCommandBar
            onSend={onSubmitPrompt}
            autoFocus={true}
          />
        </div>

        {/* 4 Compact Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                type="button"
                onClick={() => onQuickAction(action.id)}
                className="p-3 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:shadow-card transition text-left flex items-start gap-3 cursor-pointer group"
              >
                <div className="p-2 rounded-md bg-[#F0EFEA] text-[#171717] shrink-0 group-hover:text-[#00A878] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#171717] group-hover:text-[#00A878] transition-colors">
                      {action.title}
                    </h3>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A8881] group-hover:text-[#171717] transition-colors" />
                  </div>
                  <p className="text-[11px] text-[#686762] leading-snug line-clamp-1">
                    {action.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Analyses & Conversations */}
        {recentSessions.length > 0 && (
          <div className="w-full space-y-2.5 pt-2 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-[#8A8881] uppercase tracking-wider">
                Recent Analyses & Conversations
              </span>
              <button
                type="button"
                onClick={() => {
                  taskStorage.clearAll();
                  setRecentSessions([]);
                }}
                className="text-[11px] text-[#8A8881] hover:text-[#C83A3A] transition cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {recentSessions.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSavedSession && onSelectSavedSession(s)}
                  className="p-3 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:shadow-2xs transition flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-[#171717] truncate group-hover:text-[#00A878] transition-colors">
                        {s.title || s.prompt || "Analysis Task"}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#8A8881] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatSessionTime(s.updatedAt || s.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{s.messages?.length || 0} messages</span>
                        {s.deliverables && s.deliverables.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#008F68] font-medium">
                              {s.deliverables.length} deliverable{s.deliverables.length > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="p-1.5 rounded-md hover:bg-[#FDF2F2] text-[#8A8881] hover:text-[#C83A3A] transition cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Delete saved conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8A8881] group-hover:text-[#171717] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle Bottom Trust Notice */}
      <div className="pt-6 text-[11px] text-[#8A8881] flex items-center gap-3">
        <span>Local Processing</span>
        <span>•</span>
        <span>Zero WAN Egress</span>
        <span>•</span>
        <span>SHA-256 Verified Audit</span>
      </div>
    </div>
  );
};
