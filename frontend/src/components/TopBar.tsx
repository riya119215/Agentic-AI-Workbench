import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  UserCheck,
  ChevronDown,
  Layers,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Server
} from "lucide-react";
import { UserProfile, api, EgressStatus } from "../lib/api";

export type PrimaryRoute =
  | "workspace"
  | "agents"
  | "knowledge"
  | "models"
  | "vision"
  | "workflows"
  | "deliverables"
  | "security"
  | "system";

export type WorkspaceId = PrimaryRoute;

interface TopBarProps {
  activeRoute: PrimaryRoute;
  onSelectRoute: (route: PrimaryRoute) => void;
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenCommandPalette: () => void;
  pendingApprovalsCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeRoute,
  onSelectRoute,
  currentUser,
  users,
  onSelectUser,
  onOpenCommandPalette,
  pendingApprovalsCount = 0,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [securityPopoverOpen, setSecurityPopoverOpen] = useState(false);
  const [egressStatus, setEgressStatus] = useState<EgressStatus | null>(null);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const data = await api.getEgressStatus();
        setEgressStatus(data);
      } catch (err) {
        // Fallback or offline
      }
    };
    fetchSecurity();
    const interval = setInterval(fetchSecurity, 15000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const primaryNavItems: { id: PrimaryRoute; label: string }[] = isAdmin
    ? [
        { id: "workspace", label: "Workspace" },
        { id: "knowledge", label: "Knowledge" },
        { id: "models", label: "Models" },
        { id: "vision", label: "Vision" },
        { id: "workflows", label: "Workflows" },
        { id: "security", label: "Security & Audit" },
        { id: "system", label: "System" },
      ]
    : [
        { id: "workspace", label: "Workspace" },
        { id: "knowledge", label: "Knowledge" },
        { id: "deliverables", label: "Deliverables" },
        { id: "security", label: "Audit & Security" },
      ];

  const isZeroEgress = egressStatus ? egressStatus.is_air_gapped && egressStatus.wan_egress_count === 0 : true;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#DCDAD3] select-none">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[50px] gap-4">
          {/* Left Brand Identifier */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectRoute("workspace")}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-5.5 h-5.5 rounded bg-[#00A878] text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 font-sans">
                <span className="font-semibold text-xs tracking-tight text-[#171717]">
                  Sovereign AI
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#F0EFEA] text-[#686762] border border-[#DCDAD3]">
                  SIH26117
                </span>
                <span className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAF9F6] text-[#006B4D] border border-[#00A878]/30">
                  Local Execution • Live Backend
                </span>
              </div>
            </button>
          </div>


          {/* Center Role-Based Primary Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {primaryNavItems.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectRoute(item.id)}
                  className={`px-3 py-1.5 rounded text-xs font-sans transition focus:outline-none ${
                    isActive
                      ? "text-[#171717] font-semibold bg-[#F0EFEA]"
                      : "text-[#686762] hover:text-[#171717] hover:bg-[#FAF9F6]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Command Search, Security Popover, User Clearance */}
          <div className="flex items-center gap-2 shrink-0 font-sans">
            {/* Command Palette Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#FAF9F6] hover:bg-[#F0EFEA] text-[#686762] hover:text-[#171717] text-xs transition border border-[#DCDAD3]"
              title="Command Palette (Ctrl+K / ⌘K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[11px] text-[#9E9D98] font-sans hidden lg:inline">Search</span>
              <kbd className="font-mono text-[10px] bg-white border border-[#DCDAD3] px-1 py-0.2 rounded text-[#686762]">
                ⌘K
              </kbd>
            </button>

            {/* Live Security / Air-Gap Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setSecurityPopoverOpen(!securityPopoverOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
                  isZeroEgress
                    ? "bg-[#E6F7F2] text-[#006B4D] border-[#00A878]/30 hover:bg-[#d8f4ec]"
                    : "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30 hover:bg-[#fde68a]"
                }`}
                title="Zero-Egress Security Status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isZeroEgress ? "bg-[#00A878] animate-pulse-subtle" : "bg-[#F59E0B]"}`} />
                <span className="text-[11px] font-medium">
                  {isZeroEgress ? "0 WAN Sockets • Air-Gapped ✓" : "WAN Egress Detected"}
                </span>
              </button>

              {securityPopoverOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-64 bg-white border border-[#DCDAD3] rounded-lg shadow-sov-md p-3 z-50 text-xs"
                  onMouseLeave={() => setSecurityPopoverOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3] mb-2.5">
                    <span className="font-semibold text-[#171717]">Security & Zero-Egress</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${isZeroEgress ? "bg-[#E6F7F2] text-[#006B4D]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                      {isZeroEgress ? "AIR-GAPPED" : "CONNECTED"}
                    </span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#686762] flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-[#00A878]" />
                        Workspace Isolation
                      </span>
                      <span className="font-mono text-[#171717]">Strict Sandboxed</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#686762] flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-[#00A878]" />
                        WAN Egress Sockets
                      </span>
                      <span className="font-mono font-semibold text-[#171717]">
                        {egressStatus?.wan_egress_count ?? 0} active
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#686762] flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-[#00A878]" />
                        Audit Integrity
                      </span>
                      <span className="font-mono text-[#006B4D] font-medium">SHA-256 Ledger</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#686762] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#00A878]" />
                        Inference Backend
                      </span>
                      <span className="font-mono text-[#171717]">Ollama Local</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#DCDAD3] flex justify-between">
                    <button
                      onClick={() => {
                        onSelectRoute("security");
                        setSecurityPopoverOpen(false);
                      }}
                      className="text-[11px] text-[#006B4D] hover:underline font-medium"
                    >
                      View full security details →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary Modules Dropdown / User Clearance Selector */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#F0EFEA] text-xs text-[#171717] font-medium transition border border-transparent"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#686762]" />
                <span className="truncate max-w-[100px]">
                  {currentUser?.name?.split(" ")[0] || "Officer"}
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#F0EFEA] text-[#686762] border border-[#DCDAD3]">
                  {currentUser?.role || "Officer"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#9E9D98]" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-56 bg-white border border-[#DCDAD3] rounded-lg shadow-sov-md p-1.5 z-50 text-xs"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-2.5 py-1.5 border-b border-[#DCDAD3] mb-1">
                    <p className="text-[10px] uppercase text-[#9E9D98] font-semibold tracking-wider">
                      Clearance Level
                    </p>
                    <p className="text-xs font-semibold text-[#171717] mt-0.5">
                      {currentUser?.name}
                    </p>
                    <p className="text-[11px] font-mono text-[#006B4D] font-medium">
                      {currentUser?.clearance_level || "RESTRICTED"} • {currentUser?.department}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="px-2 py-1 text-[10px] uppercase text-[#9E9D98] font-semibold tracking-wider">
                      Switch Role
                    </p>
                    {users.map((u) => (
                      <button
                        key={u.user_id}
                        onClick={() => {
                          onSelectUser(u);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
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

                  <div className="pt-1.5 border-t border-[#DCDAD3] mt-1 space-y-0.5">
                    <button
                      onClick={() => {
                        onSelectRoute("deliverables");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#686762] hover:bg-[#FAF9F6] hover:text-[#171717] flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#9E9D98]" />
                      <span>Deliverables Archive</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectRoute("security");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#686762] hover:bg-[#FAF9F6] hover:text-[#171717] flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-[#9E9D98]" />
                      <span>Security & Audit Log</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectRoute("system");
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded text-xs text-[#686762] hover:bg-[#FAF9F6] hover:text-[#171717] flex items-center gap-2"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#9E9D98]" />
                      <span>Telemetry & Benchmarks</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="md:hidden flex items-center gap-1 py-1.5 overflow-x-auto border-t border-[#DCDAD3]">
          {primaryNavItems.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectRoute(item.id)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? "bg-[#F0EFEA] text-[#171717] font-semibold"
                    : "text-[#686762] hover:bg-[#FAF9F6]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
