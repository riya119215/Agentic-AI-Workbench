import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Sparkles,
  Database,
  Layers,
  Settings,
  Lock,
  Globe,
  Award,
  CheckCircle2
} from "lucide-react";
import { UserProfile } from "../../lib/api";
import { PrimaryView } from "../../lib/types";

interface TopNavProps {
  activeView: PrimaryView;
  onSelectView: (view: PrimaryView) => void;
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenNetworkModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  currentUser,
  users,
  onSelectUser,
  onOpenNetworkModal,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role?.toLowerCase().includes("admin") ||
                  currentUser?.role?.toLowerCase().includes("director") ||
                  currentUser?.user_id === "admin";

  const navItems: { id: PrimaryView; label: string; icon: any }[] = [
    { id: "workspace", label: "Command Workspace", icon: Sparkles },
    { id: "knowledge", label: "Knowledge Repository", icon: Database },
    { id: "deliverables", label: "Official Deliverables", icon: Layers },
    ...(isAdmin ? [{ id: "admin" as PrimaryView, label: "Administration", icon: Settings }] : []),
  ];

  return (
    <div className="flex flex-col select-none shrink-0 sticky top-0 z-40 shadow-sm">
      {/* Top Utility Banner Strip */}
      <div className="gov-banner-stripe text-[#E2E8F0] px-4 sm:px-6 py-1 flex items-center justify-between text-[11px] font-medium border-b border-[#1E3E62]">
        <div className="flex items-center gap-2">
          {/* Sovereign Emblem Symbol */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center text-[#07111E] font-bold text-[9px] shadow-sm">
            🛡️
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white tracking-wide">
              Sovereign Operational AI Intelligence Platform
            </span>
            <span className="text-[10px] text-[#94A3B8] hidden sm:inline">
              • Enterprise AI Directorate
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#CBD5E1]">
          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <Lock className="w-2.5 h-2.5" /> SHA-256 Cryptographic Chain
            </span>
            <span>|</span>
            <span className="flex items-center gap-1 text-[#10B981]">
              <CheckCircle2 className="w-2.5 h-2.5" /> ISO 27001 / SEC-STD Verified
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#1E3E62]/60 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[#334155]">
            <span>SIH26117</span>
          </div>
        </div>
      </div>

      {/* Main Navbar Header */}
      <header className="h-13 bg-[#0B192C] text-white border-b border-[#1E3E62] px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Emblem & Department Title */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectView("workspace")}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group"
          >
            {/* Sovereign Crest Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3E62] to-[#07111E] text-[#F59E0B] flex items-center justify-center border border-[#D97706]/40 shadow-inner group-hover:border-[#F59E0B] transition">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight group-hover:text-[#F59E0B] transition">
                  SOVEREIGN AI WORKBENCH
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D97706]/20 text-[#F59E0B] border border-[#D97706]/50">
                  Sovereign Command
                </span>
              </div>
              <span className="text-[10px] text-[#94A3B8] font-medium tracking-wide">
                Operational & Compliance Directorate
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-[#1E3E62]">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? "text-white bg-[#1E3E62] border border-[#D97706]/50 shadow-sm"
                      : "text-[#94A3B8] hover:text-white hover:bg-[#1E3E62]/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Controls: Security Badge + Officer Clearance Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Classification Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-[#D97706]/15 border border-[#D97706]/40 text-[#F59E0B]">
            <Award className="w-3 h-3 text-[#F59E0B]" />
            <span>RESTRICTED OPERATIONAL USE</span>
          </div>

          {/* Zero Egress Protected Gateway Badge */}
          <button
            onClick={onOpenNetworkModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/25 transition cursor-pointer"
            title="Protected Environment: Zero external WAN egress, on-premise local inference"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-medium">On-Premise Isolated</span>
          </button>

          {/* Officer Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#1E3E62]/80 hover:bg-[#1E3E62] text-xs text-white font-semibold transition border border-[#334155] cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#D97706]/30 text-[#F59E0B] flex items-center justify-center text-[10px] font-bold border border-[#D97706]/50">
                {currentUser?.name?.charAt(0) || "O"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="leading-none text-xs font-semibold text-white">
                  {currentUser?.name || "Officer"}
                </p>
                <p className="text-[9px] text-[#94A3B8] font-mono leading-tight mt-0.5">
                  {currentUser?.clearance_level || "SECRET"}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-64 bg-[#0B192C] border border-[#1E3E62] rounded-lg shadow-card-elevated p-2 z-50 text-xs text-white"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <div className="px-2.5 py-2 border-b border-[#1E3E62] mb-1.5 bg-[#07111E] rounded">
                  <p className="text-[10px] uppercase text-[#F59E0B] font-bold tracking-wider flex items-center justify-between">
                    <span>Officer Credentials</span>
                    <span className="font-mono text-[9px] bg-[#D97706]/20 px-1 py-0.2 rounded border border-[#D97706]/40">
                      {currentUser?.clearance_level || "RESTRICTED"}
                    </span>
                  </p>
                  <p className="text-xs font-bold text-white mt-1">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Dept: <span className="text-white font-medium">{currentUser?.department || "QA"}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="px-2 py-1 text-[10px] uppercase text-[#64748B] font-bold tracking-wider">
                    Switch Active Officer
                  </p>
                  {users.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => {
                        onSelectUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition flex items-center justify-between cursor-pointer ${
                        currentUser?.user_id === u.user_id
                          ? "bg-[#1E3E62] text-white font-semibold border-l-2 border-[#F59E0B]"
                          : "text-[#CBD5E1] hover:bg-[#1E3E62]/50 hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-[10px] text-[#94A3B8]">{u.department}</p>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#07111E] text-[#F59E0B] border border-[#1E3E62]">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};
