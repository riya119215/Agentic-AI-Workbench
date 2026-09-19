import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  UserCheck,
  Sparkles,
  Database,
  Layers,
  Settings
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
    { id: "workspace", label: "Workspace", icon: Sparkles },
    { id: "knowledge", label: "Knowledge", icon: Database },
    { id: "deliverables", label: "Deliverables", icon: Layers },
    ...(isAdmin ? [{ id: "admin" as PrimaryView, label: "Administration", icon: Settings }] : []),
  ];

  return (
    <header className="h-12 bg-white border-b border-[#DCDAD3] px-4 sm:px-6 flex items-center justify-between select-none shrink-0 sticky top-0 z-40">
      {/* Left: Clean Brand Identity */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onSelectView("workspace")}
          className="flex items-center gap-2 text-left focus:outline-none cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-[#E8F7F1] text-[#00A878] flex items-center justify-center border border-[#00A878]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-[#171717]">
              Sovereign AI
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#F0EFEA] text-[#686762] border border-[#DCDAD3]">
              SIH26117
            </span>
          </div>
        </button>

        {/* Center: Clean Enterprise Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "text-[#171717] bg-[#F0EFEA] font-semibold"
                    : "text-[#686762] hover:text-[#171717] hover:bg-[#F0EFEA]/60"
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Subtle Protected Badge + Officer Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subtle Security Badge */}
        <button
          onClick={onOpenNetworkModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#E8F7F1] border border-[#00A878]/30 text-[#008F68] hover:bg-[#00A878]/15 transition cursor-pointer"
          title="Protected Environment: Zero external WAN egress, on-premise local inference"
        >
          <span className="w-2 h-2 rounded-full bg-[#00A878]" />
          <span className="font-medium">Protected</span>
        </button>

        {/* Officer / Clearance Selector */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[#F0EFEA] text-xs text-[#171717] font-medium transition border border-[#DCDAD3] cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#686762]" />
            <span className="truncate max-w-[120px]">
              {currentUser?.name || "Officer"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#8A8881]" />
          </button>

          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-1 w-56 bg-white border border-[#DCDAD3] rounded-lg shadow-card-elevated p-1.5 z-50 text-xs"
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <div className="px-2 py-1.5 border-b border-[#DCDAD3] mb-1">
                <p className="text-[10px] uppercase text-[#8A8881] font-semibold tracking-wider">
                  Clearance Profile
                </p>
                <p className="text-xs font-semibold text-[#171717] mt-0.5">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] font-mono text-[#00A878]">
                  {currentUser?.clearance_level || "RESTRICTED"} • {currentUser?.department || "QA"}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="px-2 py-1 text-[10px] uppercase text-[#8A8881] font-semibold tracking-wider">
                  Switch User
                </p>
                {users.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => {
                      onSelectUser(u);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition flex items-center justify-between cursor-pointer ${
                      currentUser?.user_id === u.user_id
                        ? "bg-[#F0EFEA] text-[#171717] font-semibold"
                        : "text-[#686762] hover:bg-[#F0EFEA] hover:text-[#171717]"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] font-mono text-[#8A8881]">({u.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
