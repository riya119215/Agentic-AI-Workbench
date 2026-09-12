import React from "react";
import { Shield, Lock, Radio, UserCheck, Terminal, Cpu } from "lucide-react";
import { UserProfile } from "../lib/api";

interface NavbarProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  activeTab: "chat" | "kb" | "audit" | "egress";
  onSelectTab: (tab: "chat" | "kb" | "audit" | "egress") => void;
  isAirGapped: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSelectUser,
  activeTab,
  onSelectTab,
  isAirGapped,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#071324] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 border border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-wider text-base text-slate-100 uppercase">
                  Sovereign AI Workbench
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  SIH26117
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Gov / Defence / PSU Air-Gapped Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab("chat")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              Agentic Console
            </button>
            <button
              onClick={() => onSelectTab("kb")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "kb"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              Knowledge Base (RAG)
            </button>
            <button
              onClick={() => onSelectTab("audit")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "audit"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              Audit Trail (SHA-256)
            </button>
            <button
              onClick={() => onSelectTab("egress")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "egress"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              Zero-Egress Radar
            </button>
          </nav>

          {/* Right Status Badges & RBAC Switcher */}
          <div className="flex items-center space-x-3">
            {/* Air-Gap Badge */}
            <div
              onClick={() => onSelectTab("egress")}
              className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/70 border border-emerald-500/40 text-emerald-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">AIR-GAP ACTIVE</span>
            </div>

            {/* RBAC Role Switcher */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={currentUser?.user_id || ""}
                onChange={(e) => {
                  const target = users.find((u) => u.user_id === e.target.value);
                  if (target) onSelectUser(target);
                }}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id} className="bg-slate-900 text-slate-200">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
