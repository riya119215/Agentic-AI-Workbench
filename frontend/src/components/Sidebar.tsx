import React from "react";
import {
  Plus,
  FileText,
  Clock,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity
} from "lucide-react";

export interface AnalysisSession {
  id: string;
  title: string;
  timestamp: string;
  prompt: string;
  attachments: string[];
}

interface SidebarProps {
  sessions: AnalysisSession[];
  activeSessionId: string | null;
  onSelectSession: (session: AnalysisSession) => void;
  onNewAnalysis: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewAnalysis,
  isAdmin,
  onOpenAdmin,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`bg-[#FAF9F6] border-r border-[#DCDAD3] flex flex-col justify-between transition-all duration-200 shrink-0 select-none ${
        isCollapsed ? "w-14" : "w-64"
      }`}
    >
      {/* Top Action & History */}
      <div className="p-3 space-y-3 overflow-hidden">
        {/* New Analysis Button */}
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs cursor-pointer"
          title="Start New Analysis"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Analysis</span>}
        </button>

        {/* Recent Analysis List */}
        {!isCollapsed && (
          <div className="space-y-1 pt-2">
            <div className="text-[10px] uppercase font-semibold text-[#9E9D98] tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>Recent</span>
            </div>

            <div className="space-y-0.5 overflow-y-auto max-h-[calc(100vh-220px)]">
              {sessions.map((sess) => {
                const isActive = activeSessionId === sess.id;
                return (
                  <button
                    key={sess.id}
                    onClick={() => onSelectSession(sess)}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs transition flex items-center gap-2 group cursor-pointer ${
                      isActive
                        ? "bg-[#F0EFEA] text-[#171717] font-semibold"
                        : "text-[#686762] hover:bg-[#F0EFEA]/60 hover:text-[#171717]"
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#00A878]" : "text-[#9E9D98] group-hover:text-[#686762]"}`} />
                    <div className="truncate flex-1">
                      <p className="truncate">{sess.title}</p>
                      <p className="text-[10px] text-[#9E9D98] font-mono">{sess.timestamp}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Admin and Collapse controls */}
      <div className="p-3 border-t border-[#DCDAD3] space-y-1">
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#686762] hover:bg-[#F0EFEA] hover:text-[#171717] transition cursor-pointer ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Technical Administration"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0 text-[#9E9D98]" />
            {!isCollapsed && <span>Administration</span>}
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded text-[#9E9D98] hover:text-[#171717] hover:bg-[#F0EFEA] transition text-xs cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1.5 text-[11px]">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
