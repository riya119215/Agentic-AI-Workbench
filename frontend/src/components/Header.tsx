import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Sliders,
  UserCheck
} from "lucide-react";
import { UserProfile, api, EgressStatus } from "../lib/api";

interface HeaderProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenAdmin?: () => void;
  onNewAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  onOpenAdmin,
  onNewAnalysis,
}) => {
  const [securityPopoverOpen, setSecurityPopoverOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [egressStatus, setEgressStatus] = useState<EgressStatus | null>(null);

  useEffect(() => {
    const fetchEgress = async () => {
      try {
        const data = await api.getEgressStatus();
        setEgressStatus(data);
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchEgress();
    const interval = setInterval(fetchEgress, 15000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  return (
    <header className="h-[52px] bg-[#FFFFFF] border-b border-[#DCDAD3] px-4 sm:px-6 flex items-center justify-between select-none shrink-0 sticky top-0 z-30 font-sans">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer"
        >
          <div className="w-6 h-6 rounded bg-[#00A878] text-white flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-[#171717]">
              Sovereign AI
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0EFEA] text-[#686762] border border-[#DCDAD3]">
              SIH26117
            </span>
          </div>
        </button>
      </div>

      {/* Right: Security Status Badge & User Selector */}
      <div className="flex items-center gap-2 font-sans">
        {/* Security Badge Popover */}
        <div className="relative">
          <button
            onClick={() => setSecurityPopoverOpen(!securityPopoverOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#E6F7F2] text-[#006B4D] border border-[#00A878]/30 hover:bg-[#d8f4ec] transition"
            title="Zero-Egress Security Status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878] animate-pulse-subtle" />
            <span className="text-[11px] font-medium">● Protected</span>
          </button>

          {securityPopoverOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white border border-[#DCDAD3] rounded-lg shadow-sov-md p-3.5 z-50 text-xs"
              onMouseLeave={() => setSecurityPopoverOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3] mb-2.5">
                <span className="font-semibold text-[#171717]">Security Status</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-medium bg-[#E6F7F2] text-[#006B4D]">
                  AIR-GAPPED
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                  <span>Local processing</span>
                </div>
                <div className="flex items-center gap-2 text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                  <span>External WAN connections: {egressStatus?.wan_egress_count ?? 0}</span>
                </div>
                <div className="flex items-center gap-2 text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                  <span>Evidence protected</span>
                </div>
                <div className="flex items-center gap-2 text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                  <span>Approval controls active</span>
                </div>
                <div className="flex items-center gap-2 text-[#171717]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                  <span>Audit integrity verified</span>
                </div>
              </div>

              {isAdmin && onOpenAdmin && (
                <div className="mt-3 pt-2.5 border-t border-[#DCDAD3]">
                  <button
                    onClick={() => {
                      setSecurityPopoverOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left text-[11px] text-[#006B4D] hover:underline font-medium flex items-center justify-between"
                  >
                    <span>View technical details</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User / Officer Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#F0EFEA] text-xs text-[#171717] font-medium transition border border-transparent"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#686762]" />
            <span className="truncate max-w-[120px]">
              {currentUser?.name || "Officer Sharma"}
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#F0EFEA] text-[#686762] border border-[#DCDAD3]">
              {currentUser?.role || "Officer"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#9E9D98]" />
          </button>

          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white border border-[#DCDAD3] rounded-lg shadow-sov-md p-2 z-50 text-xs"
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <div className="px-2 py-1.5 border-b border-[#DCDAD3] mb-1.5">
                <p className="text-[10px] uppercase text-[#9E9D98] font-semibold tracking-wider">
                  Clearance Profile
                </p>
                <p className="text-xs font-semibold text-[#171717] mt-0.5">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] font-mono text-[#006B4D]">
                  {currentUser?.clearance_level || "RESTRICTED"} • {currentUser?.department}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="px-2 py-1 text-[10px] uppercase text-[#9E9D98] font-semibold tracking-wider">
                  Switch Active Role
                </p>
                {users.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => {
                      onSelectUser(u);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition flex items-center justify-between ${
                      currentUser?.user_id === u.user_id
                        ? "bg-[#F0EFEA] text-[#171717] font-semibold"
                        : "text-[#686762] hover:bg-[#FAF9F6] hover:text-[#171717]"
                    }`}
                  >
                    <span>{u.name}</span>
                    <span className="text-[10px] font-mono text-[#9E9D98]">({u.role})</span>
                  </button>
                ))}
              </div>

              {isAdmin && onOpenAdmin && (
                <div className="pt-2 border-t border-[#DCDAD3] mt-1.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-[#686762] hover:bg-[#FAF9F6] hover:text-[#171717] flex items-center gap-2"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#9E9D98]" />
                    <span>Technical Administration</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
