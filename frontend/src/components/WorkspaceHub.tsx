import React, { useState, useEffect } from "react";
import {
  Plus,
  ArrowRight,
  ChevronRight,
  Clock,
  FolderLock,
  FileText,
  CheckCircle2,
  Shield,
  Layers,
  X
} from "lucide-react";
import { PrimaryRoute } from "./TopBar";
import { UserProfile, api } from "../lib/api";

interface WorkspaceHubProps {
  currentUser: UserProfile | null;
  onOpenWorkspace: (workspaceId: string, name: string) => void;
  onExecuteScenario: (scenarioId: string, prompt: string, attachments: string[]) => void;
  onSelectRoute: (route: PrimaryRoute) => void;
}

interface WorkspaceItem {
  id: string;
  name: string;
  description: string;
  classification: string;
  updated: string;
  status: string;
  prompt?: string;
  attachments?: string[];
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  currentUser,
  onOpenWorkspace,
  onExecuteScenario,
  onSelectRoute,
}) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [newWsDesc, setNewWsDesc] = useState("");
  const [newWsClassification, setNewWsClassification] = useState("RESTRICTED");
  const [isCreating, setIsCreating] = useState(false);

  const defaultSeedWorkspaces: WorkspaceItem[] = [
    {
      id: "ws-turbine-07",
      name: "Turbine Unit 7 Overhaul",
      description: "QA inspection report matched against maintenance SOP-TURB-IND-2026-V4",
      classification: "SECRET",
      updated: "12m ago",
      status: "Active",
      prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
    },
    {
      id: "ws-railway-telemetry",
      name: "Railway Axle Telemetry Analysis",
      description: "Sensor anomaly detection and hot-box temperature threshold analysis",
      classification: "RESTRICTED",
      updated: "1h ago",
      status: "Completed",
      prompt: "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.",
      attachments: ["railway_sensor_telemetry.csv"]
    },
    {
      id: "ws-cavitation-defect",
      name: "Cavitation Defect Review",
      description: "Optical metrology scan evaluated against defence standard DEF-STD-05-21",
      classification: "CONFIDENTIAL",
      updated: "3h ago",
      status: "Ready",
      prompt: "Analyze scanned defect photograph for journal bearing cavitation and evaluate against defence standards.",
      attachments: ["bearing_cavitation_scan.png"]
    }
  ];

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWorkspaces();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: WorkspaceItem[] = data.map((w: any) => ({
          id: w.workspace_id || w.id,
          name: w.name || w.workspace_id,
          description: w.description || "Active sandboxed workspace",
          classification: w.classification || "RESTRICTED",
          updated: "Just now",
          status: w.status === "ACTIVE" ? "Active" : "Ready",
          prompt: "",
          attachments: []
        }));
        setWorkspaces(mapped);
      } else {
        setWorkspaces(defaultSeedWorkspaces);
      }
    } catch (err) {
      setWorkspaces(defaultSeedWorkspaces);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const created = await api.createWorkspace(
        newWsName.trim(),
        newWsDesc.trim(),
        newWsClassification,
        currentUser?.user_id || "officer_sharma"
      );
      setIsCreateModalOpen(false);
      setNewWsName("");
      setNewWsDesc("");
      onOpenWorkspace(created.workspace_id, created.name);
    } catch (err: any) {
      alert(`Failed to create workspace: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const demoScenarios = [
    {
      id: "demo-1",
      title: "Inspection → Approval note",
      tag: "DOCX note",
      desc: "Scanned inspection PDF + SOP knowledge search → Government Note Sheet (.docx)",
      prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
    },
    {
      id: "demo-2",
      title: "Telemetry → Anomaly analysis",
      tag: "Sandbox XLSX",
      desc: "Sensor CSV → Isolated Python sandbox → Summary spreadsheet (.xlsx) + plot",
      prompt: "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.",
      attachments: ["railway_sensor_telemetry.csv"]
    },
    {
      id: "demo-3",
      title: "Multi-evidence → Executive package",
      tag: "Tri-deliverables",
      desc: "PDF + CSV + Photo evidence → Multimodal verification → DOCX + XLSX + PPTX",
      prompt: "Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx).",
      attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt", "railway_sensor_telemetry.csv", "bearing_cavitation_scan.png"]
    }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Modal: Create Workspace */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCDAD3] rounded-lg shadow-sov-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCDAD3] pb-2">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-[#00A878]" />
                <h3 className="font-semibold text-sm text-[#171717]">Create Sandboxed Workspace</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#9E9D98] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-[#171717]">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 7 Turbine Overhaul"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#DCDAD3] text-[#171717] focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#171717]">Description / Mission Scope</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe the operational context..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#DCDAD3] text-[#171717] focus:outline-none focus:border-[#171717] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#171717]">Security Classification</label>
                <select
                  value={newWsClassification}
                  onChange={(e) => setNewWsClassification(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#DCDAD3] text-[#171717] bg-white focus:outline-none focus:border-[#171717]"
                >
                  <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="SECRET">SECRET</option>
                  <option value="TOP_SECRET">TOP_SECRET</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCDAD3]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#DCDAD3] text-[#686762] hover:bg-[#FAF9F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newWsName.trim()}
                  className="px-3.5 py-1.5 rounded bg-[#171717] text-white hover:bg-black font-medium disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Initialize Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCDAD3]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#171717]">
            Workspace
          </h1>
          <p className="text-xs text-[#686762] mt-0.5">
            On-premise zero-egress intelligence operations & case analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New workspace</span>
          </button>
        </div>
      </div>

      {/* 2. Recent Work: Clean Minimal Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#686762]">
              Recent Work
            </h2>
            <span className="text-[11px] font-mono text-[#9E9D98]">
              ({workspaces.length})
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#DCDAD3] rounded-lg overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCDAD3] bg-[#FAF9F6] text-[#686762] text-[11px] font-medium">
                <th className="py-2.5 px-4">Workspace Name</th>
                <th className="py-2.5 px-4 w-32">Classification</th>
                <th className="py-2.5 px-4 w-28">Status</th>
                <th className="py-2.5 px-4 w-28 text-right">Updated</th>
                <th className="py-2.5 px-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDAD3]">
              {workspaces.map((ws) => (
                <tr
                  key={ws.id}
                  onClick={() => onOpenWorkspace(ws.id, ws.name)}
                  className="hover:bg-[#F0EFEA] transition cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#171717] group-hover:text-[#006B4D] transition flex items-center gap-2">
                      <FolderLock className="w-3.5 h-3.5 text-[#9E9D98] group-hover:text-[#00A878]" />
                      <span>{ws.name}</span>
                    </div>
                    <div className="text-[11px] text-[#686762] mt-0.5 truncate max-w-lg">
                      {ws.description}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      ws.classification === "SECRET" || ws.classification === "TOP_SECRET"
                        ? "bg-[#F2EFFE] text-[#7C5CFC] border-[#7C5CFC]/30"
                        : "bg-[#F0EFEA] text-[#686762] border-[#DCDAD3]"
                    }`}>
                      {ws.classification}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#171717]">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        ws.status === "Active" ? "bg-[#00A878]" : "bg-[#9E9D98]"
                      }`} />
                      <span>{ws.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[11px] font-mono text-[#686762]">
                    {ws.updated}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <ChevronRight className="w-4 h-4 text-[#9E9D98] group-hover:text-[#171717] group-hover:translate-x-0.5 transition" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Demo Scenarios: 3 Compact Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#686762]">
              Operational Demo Scenarios
            </h2>
            <span className="text-[11px] text-[#9E9D98]">
              Pre-seeded datasets & end-to-end pipelines
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {demoScenarios.map((sc) => (
            <div
              key={sc.id}
              onClick={() => onExecuteScenario(sc.id, sc.prompt, sc.attachments)}
              className="p-3.5 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:shadow-sov-sm transition cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#FAF9F6] text-[#686762] border border-[#DCDAD3]">
                    {sc.tag}
                  </span>
                  <span className="text-[10px] text-[#9E9D98]">Instant Run</span>
                </div>
                <h3 className="font-semibold text-xs text-[#171717] group-hover:text-[#006B4D] transition">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-[#686762] leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#DCDAD3] flex items-center justify-between text-[11px] text-[#171717] font-medium group-hover:text-[#006B4D] transition">
                <span>Run scenario</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
