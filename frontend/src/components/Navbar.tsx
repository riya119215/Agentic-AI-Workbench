import React from "react";
import { Shield, Lock, Radio, UserCheck, Terminal, Cpu, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../lib/api";

interface NavbarProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  isAirGapped: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSelectUser,
  isAirGapped,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#091222] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Node & Clearance Info */}
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-cyan-400 border border-cyan-800/40 font-bold uppercase">
              NODE: LOCAL-01
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40 font-bold uppercase">
              CLEARANCE: {currentUser?.clearance_level || "RESTRICTED"}
            </span>
          </div>

          {/* Right Status Badges & RBAC Switcher */}
          <div className="flex items-center space-x-3">
            {/* Air-Gap Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-[11px]">ZERO EGRESS (0 WAN)</span>
            </div>

            {/* Local Model Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-blue-950/70 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-bold text-[11px]">LOCAL AI ACTIVE</span>
            </div>

            {/* RBAC Role Switcher */}
            <div className="flex items-center space-x-2 bg-[#060D1A] border border-slate-800 rounded-lg px-2.5 py-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={currentUser?.user_id || ""}
                onChange={(e) => {
                  const target = users.find((u) => u.user_id === e.target.value);
                  if (target) onSelectUser(target);
                }}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer font-mono"
              >
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id} className="bg-[#0B1528] text-slate-200">
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
