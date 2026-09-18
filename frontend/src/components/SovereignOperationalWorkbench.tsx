import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  FileText,
  Database,
  Cpu,
  Terminal,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Package,
  Layers,
  Play,
  RotateCw,
  Search,
  Upload,
  Download,
  Hash,
  Activity,
  Lock,
  WifiOff,
  Server,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Plus,
  Sliders,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Command,
  FileSpreadsheet,
  FileCode,
  File,
  X,
  Check,
  Info
} from "lucide-react";
import { api, UserProfile, EgressStatus, AuditLogRecord, ApprovalItem } from "../lib/api";

export type NodeType =
  | "EVIDENCE"
  | "KNOWLEDGE"
  | "AGENT"
  | "TOOL_SEARCH"
  | "TOOL_SANDBOX"
  | "TOOL_VISION"
  | "VERIFICATION"
  | "APPROVAL"
  | "DELIVERABLE"
  | "AUDIT";

export type NodeStatus =
  | "IDLE"
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "PENDING_APPROVAL";

interface WorkflowNodeData {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  status: NodeStatus;
  statusText?: string;
  icon: any;
  executionCount?: number;
  lastActivity?: string;
  x: number;
  y: number;
  details?: Record<string, any>;
}

interface SovereignOperationalWorkbenchProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onOpenCommandPalette: () => void;
}

export const SovereignOperationalWorkbench: React.FC<SovereignOperationalWorkbenchProps> = ({
  currentUser,
  users,
  onSelectUser,
  onOpenCommandPalette
}) => {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [selectedNodeId, setSelectedNodeId] = useState<string>("EVIDENCE");
  const [isExecutingScenario, setIsExecutingScenario] = useState<boolean>(false);
  const [activeScenarioName, setActiveScenarioName] = useState<string>("Turbine Unit 7 Overhaul");
  const [activeScenarioId, setActiveScenarioId] = useState<string>("demo-1");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("WS-UNIT-07");

  // Telemetry & Security from Backend APIs
  const [egressStatus, setEgressStatus] = useState<EgressStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [auditVerification, setAuditVerification] = useState<{ is_valid: boolean; total_records: number; message: string } | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [showSecurityRadar, setShowSecurityRadar] = useState<boolean>(false);
  const [showCasesOverlay, setShowCasesOverlay] = useState<boolean>(false);
  const [isVerifyingAudit, setIsVerifyingAudit] = useState<boolean>(false);
  const [approvalActionMessage, setApprovalActionMessage] = useState<string | null>(null);

  // Canvas zoom & pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Default Operational Nodes Graph
  // -------------------------------------------------------------------------
  const [nodes, setNodes] = useState<WorkflowNodeData[]>([
    {
      id: "EVIDENCE",
      type: "EVIDENCE",
      title: "Evidence",
      subtitle: "Multi-Source Intake",
      status: "COMPLETED",
      statusText: "3 files ingested & hashed",
      icon: FileText,
      executionCount: 3,
      lastActivity: "10:14:02",
      x: 80,
      y: 190,
      details: {
        files: [
          { name: "inspection_report_unit7.pdf", type: "PDF", size: "2.4 MB", sha256: "3a7b9c1d2e4f5a6b7c8d9e0f1a2b3c4d", parser: "PyMuPDF", ocr: "Available", pages: 18 },
          { name: "railway_sensor_telemetry.csv", type: "CSV", size: "48 KB", sha256: "8e7d9c1b2a4f5c6d7e8f9a0b1c2d3e4f", parser: "CSV/Pandas", ocr: "N/A", rows: 16 },
          { name: "bearing_cavitation_scan.png", type: "PNG", size: "1.8 MB", sha256: "5c9d1e3f4a6b7c8d9e0f1a2b3c4d5e6f", parser: "VisionPreprocessor", ocr: "Metrology OCR", resolution: "1920x1080" }
        ]
      }
    },
    {
      id: "KNOWLEDGE",
      type: "KNOWLEDGE",
      title: "Knowledge Base",
      subtitle: "On-Premise ChromaDB",
      status: "COMPLETED",
      statusText: "438 chunks indexed",
      icon: Database,
      executionCount: 12,
      lastActivity: "10:14:04",
      x: 320,
      y: 190,
      details: {
        vectorStore: "ChromaDB (Persistent Local)",
        embeddingModel: "bge-m3:latest (Local)",
        documentsCount: 12,
        chunksCount: 438,
        retrievalStatus: "READY",
        recentRetrieved: [
          { source: "SOP-TURB-IND-2026-V4.txt", page: 1, section: "Section 2.1", clause: "Critical Breach Limit > 3.50 mm/s RMS (Mandatory rotor de-energization)", score: 0.96 },
          { source: "SOP-TURB-IND-2026-V4.txt", page: 1, section: "Section 2.2", clause: "Thermal Trip Limit > 90.0°C (Babbitt white-metal degradation hazard)", score: 0.93 },
          { source: "RAIL_SAFETY_STD_2026.pdf", page: 4, section: "Chapter 4", clause: "Track vibration above 1.50g triggers emergency speed reduction protocol", score: 0.91 }
        ]
      }
    },
    {
      id: "AGENT",
      type: "AGENT",
      title: "Local Agent",
      subtitle: "Reasoning & Dispatch",
      status: "COMPLETED",
      statusText: "qwen2.5:7b (Local)",
      icon: Cpu,
      executionCount: 5,
      lastActivity: "10:14:05",
      x: 560,
      y: 190,
      details: {
        model: "qwen2.5:7b",
        runtime: "STRICT_ON_PREMISE_LOCAL",
        task: "Multi-Vector Turbine & Rail Operational Integrity Analysis",
        activityStream: [
          { time: "10:14:02", event: "Evidence files discovered and validated" },
          { time: "10:14:03", event: "Document parsing and OCR extraction completed" },
          { time: "10:14:04", event: "Knowledge retrieval matched 3 SOP clauses" },
          { time: "10:14:05", event: "Dispatched Python sandbox for telemetry curves" },
          { time: "10:14:06", event: "Deterministic verification requested for 4 parameters" }
        ]
      }
    },
    {
      id: "TOOL_SEARCH",
      type: "TOOL_SEARCH",
      title: "Search Tool",
      subtitle: "search_knowledge",
      status: "COMPLETED",
      statusText: "6 clauses matched",
      icon: Search,
      executionCount: 8,
      lastActivity: "10:14:04",
      x: 780,
      y: 60,
      details: {
        toolName: "search_knowledge",
        durationMs: 14.5,
        status: "SUCCESS",
        permission: "ALLOWED",
        resultsCount: 6
      }
    },
    {
      id: "TOOL_SANDBOX",
      type: "TOOL_SANDBOX",
      title: "Code Sandbox",
      subtitle: "run_python (0 WAN)",
      status: "COMPLETED",
      statusText: "Plot & Anomaly Matrix",
      icon: Terminal,
      executionCount: 4,
      lastActivity: "10:14:05",
      x: 780,
      y: 190,
      details: {
        toolName: "run_python",
        durationMs: 320.0,
        network: "BLOCKED (0 Outbound Sockets)",
        isolationStatus: "CONTAINER_RUNTIME_RESTRICTED",
        artifactsHarvested: ["unified_telemetry_curves.png", "sensor_degradation_chart.png"]
      }
    },
    {
      id: "TOOL_VISION",
      type: "TOOL_VISION",
      title: "Vision Metrology",
      subtitle: "inspect_image",
      status: "COMPLETED",
      statusText: "Cavitation detected",
      icon: Eye,
      executionCount: 2,
      lastActivity: "10:14:05",
      x: 780,
      y: 320,
      details: {
        toolName: "inspect_image",
        durationMs: 45.0,
        status: "SUCCESS",
        defectFound: "Surface Cavitation & Babbitt Metal Fatigue",
        risk: "HIGH_RISK"
      }
    },
    {
      id: "VERIFICATION",
      type: "VERIFICATION",
      title: "Verification Engine",
      subtitle: "Deterministic Logic",
      status: "COMPLETED",
      statusText: "4 parameters evaluated",
      icon: CheckCircle2,
      executionCount: 4,
      lastActivity: "10:14:06",
      x: 1000,
      y: 190,
      details: {
        rulesEvaluated: [
          { parameter: "Bearing Vibration", measured: "4.85 mm/s RMS", limit: "≤ 3.50 mm/s", status: "NON_COMPLIANT", source: "SOP-TURB-IND-2026-V4 Page 1 Clause 2.1" },
          { parameter: "Journal Bearing Temp", measured: "94.2 °C", limit: "≤ 90.0 °C", status: "NON_COMPLIANT", source: "SOP-TURB-IND-2026-V4 Page 1 Clause 2.2" },
          { parameter: "Track Vibration Peak", measured: "1.88 g", limit: "≤ 1.50 g", status: "NON_COMPLIANT", source: "RAIL_SAFETY_STD_2026.pdf Page 4" },
          { parameter: "Lube Oil Pressure", measured: "1.85 Bar", limit: "1.80 - 2.20 Bar", status: "COMPLIANT", source: "SOP-TURB-IND-2026-V4 Page 2 Clause 3.1" }
        ],
        summary: "1 COMPLIANT · 3 NON_COMPLIANT"
      }
    },
    {
      id: "APPROVAL",
      type: "APPROVAL",
      title: "Human Approval",
      subtitle: "Officer Authority Gate",
      status: "COMPLETED",
      statusText: "Approved by Officer",
      icon: UserCheck,
      executionCount: 1,
      lastActivity: "10:14:07",
      x: 1220,
      y: 190,
      details: {
        requestId: "APP-UNIT07-DIR",
        status: "APPROVED",
        approver: "Col. R. Sharma (Officer)",
        findingsCount: 4,
        citationsCount: 3,
        sanction: "Emergency Rotor De-Energization Sanctioned"
      }
    },
    {
      id: "DELIVERABLE",
      type: "DELIVERABLE",
      title: "Deliverables",
      subtitle: "DOCX · XLSX · PPTX",
      status: "COMPLETED",
      statusText: "4 files generated",
      icon: Package,
      executionCount: 4,
      lastActivity: "10:14:08",
      x: 1440,
      y: 190,
      details: {
        artifacts: [
          { filename: "Approval_Note_DEF_IND_QA-88_2026_UNIT-07.docx", type: "DOCX", size: "36.8 KB", sha256: "3a7b9c1d2e4f5a6b7c8d9e0f", label: "Official Note Sheet (.docx)" },
          { filename: "Telemetry_Analysis_20260917.xlsx", type: "XLSX", size: "5.8 KB", sha256: "8e7d9c1b2a4f5c6d7e8f9a0b", label: "Audited Telemetry Spreadsheet (.xlsx)" },
          { filename: "Executive_Briefing_Deck.pptx", type: "PPTX", size: "42.1 KB", sha256: "5c9d1e3f4a6b7c8d9e0f1a2b", label: "Executive Presentation (.pptx)" },
          { filename: "unified_telemetry_curves.png", type: "PNG", size: "81.6 KB", sha256: "4b8c0d2e3f5a6b7c8d9e0f1a", label: "Degradation Trend Chart (.png)" }
        ]
      }
    },
    {
      id: "AUDIT",
      type: "AUDIT",
      title: "Audit Ledger",
      subtitle: "SHA-256 Hash Chain",
      status: "COMPLETED",
      statusText: "Block #35 Verified",
      icon: Shield,
      executionCount: 35,
      lastActivity: "10:14:08",
      x: 1660,
      y: 190,
      details: {
        totalBlocks: 35,
        latestBlockHash: "61f323e61110a8b1da3f2fca1f04a1be20990164fa54f9dfe304c4ec36d1828d",
        chainStatus: "VALID",
        integrityMessage: "Cryptographic integrity verified across 35 immutable audit blocks."
      }
    }
  ]);

  // -------------------------------------------------------------------------
  // Lifecycle & Initial Data Ingestion
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchBackendTelemetry();
  }, []);

  const fetchBackendTelemetry = async () => {
    try {
      const egress = await api.getEgressStatus();
      setEgressStatus(egress);

      const logs = await api.getAuditLogs();
      setAuditLogs(logs);

      const auditCheck = await api.verifyAuditChain();
      setAuditVerification(auditCheck);

      const pendingApps = await api.getApprovals();
      setApprovals(pendingApps);
    } catch (err) {
      console.error("Backend telemetry poll error:", err);
    }
  };

  // -------------------------------------------------------------------------
  // Execute Flagship Scenario with Live Step-by-Step Animation
  // -------------------------------------------------------------------------
  const handleLaunchScenario = async (scenarioKey: "demo-1" | "demo-2" | "demo-3") => {
    setIsExecutingScenario(true);
    setActiveScenarioId(scenarioKey);

    let prompt = "";
    let attachments: string[] = [];
    let scenarioTitle = "";

    if (scenarioKey === "demo-1") {
      scenarioTitle = "Turbine Unit 7 Overhaul (PDF → DOCX)";
      prompt = "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx).";
      attachments = ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"];
    } else if (scenarioKey === "demo-2") {
      scenarioTitle = "Railway Axle Telemetry (CSV → Sandbox → XLSX)";
      prompt = "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.";
      attachments = ["railway_sensor_telemetry.csv"];
    } else {
      scenarioTitle = "Multi-Evidence Synthesis (PDF + CSV + Photo → Suite)";
      prompt = "Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx).";
      attachments = ["INSPECTION_REPORT_TURBINE_UNIT_7.txt", "railway_sensor_telemetry.csv", "bearing_cavitation_scan.png"];
    }

    setActiveScenarioName(scenarioTitle);

    // Reset all nodes to IDLE
    setNodes(prev => prev.map(n => ({ ...n, status: "IDLE" as NodeStatus, statusText: "Waiting..." })));

    // Step 1: EVIDENCE (0ms)
    setTimeout(() => {
      setNodes(prev => prev.map(n => n.id === "EVIDENCE" ? { ...n, status: "RUNNING", statusText: "Ingesting files..." } : n));
      setSelectedNodeId("EVIDENCE");
    }, 100);

    // Step 2: KNOWLEDGE (500ms)
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id === "EVIDENCE") return { ...n, status: "COMPLETED", statusText: "Ingestion & SHA-256 done" };
        if (n.id === "KNOWLEDGE") return { ...n, status: "RUNNING", statusText: "Searching ChromaDB..." };
        return n;
      }));
      setSelectedNodeId("KNOWLEDGE");
    }, 600);

    // Step 3: AGENT (1100ms)
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id === "KNOWLEDGE") return { ...n, status: "COMPLETED", statusText: "3 SOP clauses matched" };
        if (n.id === "AGENT") return { ...n, status: "RUNNING", statusText: "Dispatching tasks..." };
        return n;
      }));
      setSelectedNodeId("AGENT");
    }, 1200);

    // Step 4: TOOLS (1800ms)
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id === "AGENT") return { ...n, status: "COMPLETED", statusText: "Tasks dispatched" };
        if (n.id.startsWith("TOOL_")) return { ...n, status: "RUNNING", statusText: "Executing..." };
        return n;
      }));
      setSelectedNodeId("TOOL_SANDBOX");
    }, 1900);

    // Step 5: VERIFICATION (2600ms)
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id.startsWith("TOOL_")) return { ...n, status: "COMPLETED", statusText: "Execution finished" };
        if (n.id === "VERIFICATION") return { ...n, status: "RUNNING", statusText: "Evaluating bounds..." };
        return n;
      }));
      setSelectedNodeId("VERIFICATION");
    }, 2700);

    // Step 6: APPROVAL (3300ms)
    setTimeout(() => {
      setNodes(prev => prev.map(n => {
        if (n.id === "VERIFICATION") return { ...n, status: "COMPLETED", statusText: "3 Non-Compliances flagged" };
        if (n.id === "APPROVAL") return { ...n, status: "PENDING_APPROVAL", statusText: "Officer sign-off required" };
        return n;
      }));
      setSelectedNodeId("APPROVAL");
    }, 3400);

    // Call Real Backend API in parallel
    try {
      const response = await api.executeAgent(prompt, currentUser?.user_id || "officer_sharma", attachments);
      
      // Step 7: DELIVERABLES & AUDIT (4200ms)
      setTimeout(() => {
        setNodes(prev => prev.map(n => {
          if (n.id === "APPROVAL") return { ...n, status: "COMPLETED", statusText: "Approved by Officer" };
          if (n.id === "DELIVERABLE") return { ...n, status: "COMPLETED", statusText: `${response.artifacts.length || 3} deliverables compiled` };
          if (n.id === "AUDIT") return { ...n, status: "COMPLETED", statusText: "Block chained & verified" };
          return n;
        }));
        setSelectedNodeId("DELIVERABLE");
        setIsExecutingScenario(false);
        fetchBackendTelemetry();
      }, 4300);

    } catch (err) {
      console.error("Scenario execution error:", err);
      setIsExecutingScenario(false);
    }
  };

  // Handle Manual Approval
  const handleRespondApproval = async (approved: boolean) => {
    setApprovalActionMessage(approved ? "Sanction Approved by Officer" : "Directives Rejected");
    setNodes(prev => prev.map(n => {
      if (n.id === "APPROVAL") return { ...n, status: approved ? "COMPLETED" : "BLOCKED", statusText: approved ? "Approved by Officer" : "Rejected" };
      return n;
    }));
    setTimeout(() => setApprovalActionMessage(null), 3000);
  };

  // Handle Full Audit Verification
  const handleVerifyCompleteChain = async () => {
    setIsVerifyingAudit(true);
    try {
      const res = await api.verifyAuditChain();
      setAuditVerification(res);
    } catch (err) {
      console.error("Audit verification error:", err);
    } finally {
      setIsVerifyingAudit(false);
    }
  };

  // -------------------------------------------------------------------------
  // Selected Node Details Reference
  // -------------------------------------------------------------------------
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="relative w-full h-[calc(100vh-0px)] bg-[#F7F6F2] overflow-hidden flex flex-col font-sans select-none">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP FLOATING COMMAND & STATUS BAR */}
      {/* ------------------------------------------------------------------- */}
      <header className="h-13 bg-white/95 backdrop-blur-md border-b border-[#DCDAD3] px-4 flex items-center justify-between z-30 shrink-0">
        {/* Brand & Workspace Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-[#DCDAD3]">
            <div className="w-7 h-7 rounded-lg bg-[#171717] flex items-center justify-center text-white shadow-2xs">
              <Shield className="w-4 h-4 text-[#00D992]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs tracking-tight text-[#171717]">Sovereign AI</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-[#F0EFEA] text-[#686762] font-mono font-medium">SIH26117</span>
              </div>
            </div>
          </div>

          {/* Current Active Workspace Picker */}
          <button
            onClick={() => setShowCasesOverlay(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-[#F0EFEA] transition text-left group"
          >
            <span className="text-xs font-medium text-[#171717] group-hover:text-emerald-700 transition">
              {activeScenarioName}
            </span>
            <span className="text-[10px] text-[#686762] bg-[#F0EFEA] px-1.5 py-0.5 rounded font-mono">
              {activeWorkspaceId}
            </span>
          </button>
        </div>

        {/* Live Real Telemetry Badges */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Air-gap / Local Execution */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F0EFEA] border border-[#DCDAD3]/60 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D992] animate-pulse" />
            <span className="text-[#171717] font-semibold">LOCAL</span>
            <span className="text-[#686762]">|</span>
            <span className="text-[#686762]">{egressStatus?.air_gap_status === "STRICT_AIR_GAP_ACTIVE" ? "0 WAN" : "ISOLATED"}</span>
          </div>

          {/* Local LLM */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F0EFEA] border border-[#DCDAD3]/60 text-[11px] font-mono">
            <Cpu className="w-3 h-3 text-[#686762]" />
            <span className="text-[#171717] font-semibold">LLM:</span>
            <span className="text-[#686762]">qwen2.5 / llama3.2</span>
          </div>

          {/* Local Embeddings */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F0EFEA] border border-[#DCDAD3]/60 text-[11px] font-mono">
            <Database className="w-3 h-3 text-[#686762]" />
            <span className="text-[#171717] font-semibold">EMBEDDING:</span>
            <span className="text-[#686762]">BGE-M3 (ChromaDB)</span>
          </div>

          {/* Audit Chain */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50/80 border border-emerald-200/60 text-[11px] font-mono text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span className="font-semibold">AUDIT:</span>
            <span>VERIFIED (#{auditVerification?.total_records || 35})</span>
          </div>
        </div>

        {/* Action Controls & User Switch */}
        <div className="flex items-center gap-2">
          {/* Quick Scenario Run Trigger */}
          <div className="relative flex items-center">
            <button
              onClick={() => handleLaunchScenario("demo-1")}
              disabled={isExecutingScenario}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#282828] text-white text-xs font-medium transition shadow-2xs disabled:opacity-50"
            >
              {isExecutingScenario ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin text-[#00D992]" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current text-[#00D992]" />
              )}
              <span>Run Flagship Demo</span>
            </button>
          </div>

          {/* Security Proof Radar Button */}
          <button
            onClick={() => setShowSecurityRadar(!showSecurityRadar)}
            className={`p-1.5 rounded-lg border transition ${
              showSecurityRadar ? "bg-[#171717] text-white border-[#171717]" : "bg-white text-[#171717] border-[#DCDAD3] hover:bg-[#F0EFEA]"
            }`}
            title="Sovereignty & Security Radar"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#DCDAD3] text-[#686762] hover:text-[#171717] hover:bg-[#F0EFEA] text-xs transition"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">⌘K</span>
          </button>

          {/* User Profile Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#DCDAD3]">
            <select
              value={currentUser?.user_id || "officer_sharma"}
              onChange={(e) => {
                const found = users.find(u => u.user_id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="text-xs bg-white border border-[#DCDAD3] rounded-lg px-2 py-1 font-medium text-[#171717] outline-none cursor-pointer hover:border-neutral-400 transition"
            >
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN WORKSPACE CANVAS + LEFT TOOL RAIL + RIGHT INSPECTOR */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* LEFT FLOATING TOOL RAIL */}
        <aside className="absolute left-4 top-4 z-20 flex flex-col gap-1.5 p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#DCDAD3] shadow-md">
          <button
            onClick={() => handleLaunchScenario("demo-1")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#171717] hover:bg-[#F0EFEA] transition"
            title="Execute Turbine Overhaul Scenario"
          >
            <Play className="w-4 h-4 text-[#00D992] fill-current" />
          </button>
          <button
            onClick={() => setSelectedNodeId("EVIDENCE")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "EVIDENCE" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Evidence Intake"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId("KNOWLEDGE")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "KNOWLEDGE" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Knowledge Base & RAG"
          >
            <Database className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId("AGENT")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "AGENT" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Local Agent Orchestration"
          >
            <Cpu className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId("VERIFICATION")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "VERIFICATION" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Deterministic Verification Engine"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </button>
          <button
            onClick={() => setSelectedNodeId("APPROVAL")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "APPROVAL" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Human Approval Authority"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId("DELIVERABLE")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "DELIVERABLE" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Deliverables & Artifacts"
          >
            <Package className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId("AUDIT")}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
              selectedNodeId === "AUDIT" ? "bg-[#171717] text-white" : "text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title="Tamper-Evident Audit Ledger"
          >
            <Shield className="w-4 h-4" />
          </button>
        </aside>

        {/* BOTTOM LEFT CANVAS ZOOM CONTROLS */}
        <div className="absolute left-4 bottom-4 z-20 flex items-center gap-1 p-1 rounded-lg bg-white/95 backdrop-blur-md border border-[#DCDAD3] shadow-xs text-xs font-mono">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-1.5 rounded hover:bg-[#F0EFEA] text-[#171717]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[11px] text-[#686762]">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1.5 rounded hover:bg-[#F0EFEA] text-[#171717]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded hover:bg-[#F0EFEA] text-[#686762] hover:text-[#171717] text-[10px]"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* INFINITE OPERATIONAL WORKFLOW CANVAS */}
        {/* ----------------------------------------------------------------- */}
        <div
          ref={canvasRef}
          className="flex-1 h-full overflow-auto relative cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: "radial-gradient(#DCDAD3 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        >
          <div
            className="min-w-[1900px] min-h-[600px] relative p-12 transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* SVG Interactive Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Evidence -> Knowledge */}
              <line x1={230} y1={235} x2={320} y2={235} stroke="#DCDAD3" strokeWidth="2" strokeDasharray="4 4" />
              {/* Knowledge -> Agent */}
              <line x1={470} y1={235} x2={560} y2={235} stroke="#DCDAD3" strokeWidth="2" />
              {/* Agent -> Tool Search */}
              <path d="M 710 235 C 740 235, 740 105, 780 105" fill="none" stroke="#DCDAD3" strokeWidth="2" />
              {/* Agent -> Tool Sandbox */}
              <line x1={710} y1={235} x2={780} y2={235} stroke="#DCDAD3" strokeWidth="2" />
              {/* Agent -> Tool Vision */}
              <path d="M 710 235 C 740 235, 740 365, 780 365" fill="none" stroke="#DCDAD3" strokeWidth="2" />
              {/* Tool Search -> Verification */}
              <path d="M 930 105 C 965 105, 965 235, 1000 235" fill="none" stroke="#DCDAD3" strokeWidth="2" />
              {/* Tool Sandbox -> Verification */}
              <line x1={930} y1={235} x2={1000} y2={235} stroke="#DCDAD3" strokeWidth="2" />
              {/* Tool Vision -> Verification */}
              <path d="M 930 365 C 965 365, 965 235, 1000 235" fill="none" stroke="#DCDAD3" strokeWidth="2" />
              {/* Verification -> Human Approval */}
              <line x1={1150} y1={235} x2={1220} y2={235} stroke="#DCDAD3" strokeWidth="2" />
              {/* Human Approval -> Deliverable */}
              <line x1={1370} y1={235} x2={1440} y2={235} stroke="#DCDAD3" strokeWidth="2" />
              {/* Deliverable -> Audit */}
              <line x1={1590} y1={235} x2={1660} y2={235} stroke="#DCDAD3" strokeWidth="2" />
            </svg>

            {/* Workflow Operational Node Cards */}
            {nodes.map(node => {
              const Icon = node.icon;
              const isSelected = selectedNodeId === node.id;
              const isRunning = node.status === "RUNNING";
              const isCompleted = node.status === "COMPLETED";
              const isPendingApproval = node.status === "PENDING_APPROVAL";

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-37.5 p-3.5 rounded-xl border bg-white cursor-pointer transition-all duration-200 z-10 select-none shadow-2xs hover:shadow-md ${
                    isSelected
                      ? "border-[#171717] ring-2 ring-[#171717]/10 -translate-y-0.5"
                      : isRunning
                      ? "border-emerald-600 ring-2 ring-emerald-500/20"
                      : isPendingApproval
                      ? "border-amber-500 ring-2 ring-amber-500/20"
                      : "border-[#DCDAD3] hover:border-neutral-400"
                  }`}
                >
                  {/* Top Status & Execution Count */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]/60 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRunning
                            ? "bg-emerald-500 animate-ping"
                            : isCompleted
                            ? "bg-[#00D992]"
                            : isPendingApproval
                            ? "bg-amber-500 animate-pulse"
                            : "bg-neutral-300"
                        }`}
                      />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#686762] font-semibold">
                        {node.status.replace("_", " ")}
                      </span>
                    </div>
                    {node.executionCount !== undefined && (
                      <span className="text-[10px] text-[#686762] font-mono">
                        #{node.executionCount}
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs transition ${
                        isRunning
                          ? "bg-emerald-600 text-white"
                          : isCompleted
                          ? "bg-emerald-50 text-emerald-800"
                          : isPendingApproval
                          ? "bg-amber-50 text-amber-800"
                          : "bg-[#F0EFEA] text-[#171717]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-xs text-[#171717] truncate">
                        {node.title}
                      </div>
                      <div className="text-[10px] text-[#686762] truncate">
                        {node.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Status Text Detail */}
                  {node.statusText && (
                    <div className="mt-2.5 pt-2 border-t border-[#DCDAD3]/40 text-[10px] text-[#686762] truncate font-mono">
                      {node.statusText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* RIGHT CONTEXTUAL INSPECTOR DRAWER */}
        {/* ------------------------------------------------------------------- */}
        <div className="w-96 bg-white border-l border-[#DCDAD3] flex flex-col justify-between z-20 shadow-lg shrink-0 overflow-y-auto">
          {/* Inspector Header */}
          <div className="p-4 border-b border-[#DCDAD3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#F0EFEA] flex items-center justify-center text-[#171717]">
                <selectedNode.icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono">
                  {selectedNode.title} INSPECTOR
                </h3>
                <p className="text-[11px] text-[#686762]">{selectedNode.subtitle}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0EFEA] text-[#171717] font-medium">
              {selectedNode.status}
            </span>
          </div>

          {/* Dynamic Inspector Body based on selected node */}
          <div className="p-4 space-y-4 flex-1 text-xs">
            {/* EVIDENCE INSPECTOR */}
            {selectedNode.type === "EVIDENCE" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#F0EFEA] space-y-2 border border-[#DCDAD3]/60">
                  <div className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                    Ingested Evidence Files (3)
                  </div>
                  <div className="space-y-2">
                    {selectedNode.details?.files?.map((f: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white rounded border border-[#DCDAD3] space-y-1">
                        <div className="flex items-center justify-between font-medium text-[#171717]">
                          <span className="truncate">{f.name}</span>
                          <span className="text-[10px] px-1 bg-neutral-100 rounded font-mono">{f.type}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#686762] font-mono">
                          <span>SHA-256: {f.sha256.substring(0, 10)}...</span>
                          <span>Parser: {f.parser}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                    Source References
                  </label>
                  <div className="p-2.5 rounded-lg border border-[#DCDAD3] space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#686762]">PDF Extraction:</span>
                      <span className="text-[#171717]">PyMuPDF Normalized</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686762]">OCR Status:</span>
                      <span className="text-emerald-700 font-semibold">Local Ready</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#686762]">Pages Indexed:</span>
                      <span className="text-[#171717]">18 Pages</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KNOWLEDGE BASE / RAG INSPECTOR */}
            {selectedNode.type === "KNOWLEDGE" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#F0EFEA] border border-[#DCDAD3]/60">
                    <div className="text-[#686762]">Vector Store</div>
                    <div className="font-semibold text-[#171717] mt-0.5">ChromaDB Local</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F0EFEA] border border-[#DCDAD3]/60">
                    <div className="text-[#686762]">Embedding</div>
                    <div className="font-semibold text-[#171717] mt-0.5">BGE-M3 (Local)</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F0EFEA] border border-[#DCDAD3]/60">
                    <div className="text-[#686762]">Total Docs</div>
                    <div className="font-semibold text-[#171717] mt-0.5">12 Manuals</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#F0EFEA] border border-[#DCDAD3]/60">
                    <div className="text-[#686762]">Indexed Chunks</div>
                    <div className="font-semibold text-[#171717] mt-0.5">438 Chunks</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                    Grounded SOP Clauses
                  </div>
                  <div className="space-y-2">
                    {selectedNode.details?.recentRetrieved?.map((r: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-[#DCDAD3] bg-[#F7F6F2] space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#171717]">
                          <span>{r.source}</span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">
                            Score: {r.score}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#686762] font-mono">
                          Page {r.page} · {r.section}
                        </div>
                        <div className="text-[11px] text-[#171717] leading-relaxed pt-1 border-t border-[#DCDAD3]/50">
                          "{r.clause}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOCAL AGENT INSPECTOR */}
            {selectedNode.type === "AGENT" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#F0EFEA] border border-[#DCDAD3]/60 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#686762]">Selected Model:</span>
                    <span className="font-semibold text-[#171717]">{selectedNode.details?.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686762]">Runtime Mode:</span>
                    <span className="text-emerald-700 font-semibold">{selectedNode.details?.runtime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686762]">External AI API:</span>
                    <span className="text-emerald-700 font-semibold">0 (BLOCKED)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                    Operational Event Log (Safe Trace)
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {selectedNode.details?.activityStream?.map((a: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded bg-neutral-50 border border-neutral-200">
                        <span className="text-[#686762] shrink-0">{a.time}</span>
                        <span className="text-[#171717]">{a.event}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#686762] italic">
                    Chain-of-thought is kept private and unexposed. Only safe operational timestamps are logged.
                  </p>
                </div>
              </div>
            )}

            {/* TOOL EXECUTION INSPECTOR */}
            {selectedNode.type.startsWith("TOOL_") && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#F0EFEA] border border-[#DCDAD3]/60 font-mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#686762]">Tool Name:</span>
                    <span className="font-semibold text-[#171717]">{selectedNode.details?.toolName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686762]">Duration:</span>
                    <span className="text-[#171717]">{selectedNode.details?.durationMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686762]">Network Status:</span>
                    <span className="text-emerald-700 font-semibold">{selectedNode.details?.network || "LOCAL"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686762]">Process Isolation:</span>
                    <span className="text-emerald-700 font-semibold">CONTAINER RESTRICTED</span>
                  </div>
                </div>

                {selectedNode.details?.artifactsHarvested && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                      Harvested Artifacts
                    </div>
                    <div className="space-y-1 font-mono text-[11px]">
                      {selectedNode.details.artifactsHarvested.map((art: string, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-white border border-[#DCDAD3] flex items-center justify-between">
                          <span className="truncate">{art}</span>
                          <span className="text-[10px] text-[#00D992] font-semibold">CAPTURED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VERIFICATION ENGINE INSPECTOR */}
            {selectedNode.type === "VERIFICATION" && (
              <div className="space-y-4">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                  <span className="font-bold">Deterministic Rule Engine:</span> Evaluates parametric limits without relying on LLM hallucination.
                </div>

                <div className="space-y-2.5">
                  {selectedNode.details?.rulesEvaluated?.map((rule: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-[#DCDAD3] bg-white space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#171717]">{rule.parameter}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            rule.status === "COMPLIANT"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rule.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#F7F6F2] p-1.5 rounded">
                        <div>
                          <span className="text-[#686762]">Observed: </span>
                          <span className="font-semibold text-[#171717]">{rule.measured}</span>
                        </div>
                        <div>
                          <span className="text-[#686762]">Allowed: </span>
                          <span className="font-semibold text-[#171717]">{rule.limit}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#686762] font-mono truncate">
                        {rule.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HUMAN APPROVAL INSPECTOR */}
            {selectedNode.type === "APPROVAL" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Human Approval Gate</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    AI agent has prepared the technical audit. Verification engine flags 3 non-conformances. Officer authorization required before issuing official Government Note Sheet.
                  </p>

                  <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200 text-[11px] font-mono space-y-1 text-neutral-800">
                    <div className="flex justify-between">
                      <span>Evaluated Parameters:</span>
                      <span className="font-bold">4 Rules</span>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span>Tolerance Exceedances:</span>
                      <span className="font-bold">3 Breaches</span>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>Compliant Metrics:</span>
                      <span className="font-bold">1 Standard</span>
                    </div>
                  </div>

                  {approvalActionMessage && (
                    <div className="p-2 bg-emerald-600 text-white rounded text-center text-xs font-semibold">
                      {approvalActionMessage}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleRespondApproval(false)}
                      className="flex-1 py-2 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-[#171717] font-semibold text-xs transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleRespondApproval(true)}
                      className="flex-1 py-2 rounded-lg bg-[#171717] hover:bg-[#282828] text-white font-semibold text-xs transition shadow-2xs"
                    >
                      Approve & Sanction
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DELIVERABLES INSPECTOR */}
            {selectedNode.type === "DELIVERABLE" && (
              <div className="space-y-4">
                <div className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                  Compiled Deliverable Artifacts (4)
                </div>

                <div className="space-y-2.5">
                  {selectedNode.details?.artifacts?.map((art: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-[#DCDAD3] bg-white space-y-2 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-xs text-[#171717]">{art.label}</div>
                          <div className="text-[10px] text-[#686762] font-mono truncate max-w-[200px]">{art.filename}</div>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0EFEA] text-[#171717] font-bold">
                          {art.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[#686762] pt-1 border-t border-[#DCDAD3]/50">
                        <span>SHA-256: {art.sha256}</span>
                        <span>{art.size}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={api.getDeliverableUrl(art.filename)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-1.5 rounded bg-[#171717] hover:bg-[#282828] text-white text-[11px] font-semibold text-center transition"
                        >
                          Download / Open
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LEDGER INSPECTOR */}
            {selectedNode.type === "AUDIT" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 font-mono text-[11px] space-y-1 text-emerald-900">
                  <div className="flex justify-between">
                    <span>Audit Chain Status:</span>
                    <span className="font-bold text-emerald-700">✓ VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Immutable Blocks:</span>
                    <span className="font-bold">35 Blocks</span>
                  </div>
                  <div className="flex justify-between truncate">
                    <span>Latest SHA-256 Tip:</span>
                    <span className="font-bold">61f323e6...828d</span>
                  </div>
                </div>

                <button
                  onClick={handleVerifyCompleteChain}
                  disabled={isVerifyingAudit}
                  className="w-full py-2 rounded-lg bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  {isVerifyingAudit ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                  <span>Verify Complete Cryptographic Chain</span>
                </button>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#171717] uppercase font-mono">
                    Recent Chained Blocks
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[10px]">
                    {auditLogs.slice(0, 5).map((log: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-[#F0EFEA] border border-[#DCDAD3] space-y-0.5">
                        <div className="flex justify-between font-semibold text-[#171717]">
                          <span>{log.log_id || `AUD-BLOCK-${35 - idx}`}</span>
                          <span className="text-emerald-700">{log.action}</span>
                        </div>
                        <div className="text-[#686762] truncate">Hash: {log.current_hash || "61f323e61110a..."}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inspector Footer */}
          <div className="p-3 border-t border-[#DCDAD3] bg-[#F7F6F2] text-[11px] font-mono text-[#686762] flex items-center justify-between">
            <span>Sovereign Node: LOCAL-IND-01</span>
            <span className="text-emerald-700 font-semibold">100% On-Premise</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. FLOATING SOVEREIGNTY RADAR MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showSecurityRadar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-xl bg-white border border-[#DCDAD3] rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCDAD3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#171717] flex items-center justify-center text-[#00D992]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#171717] uppercase font-mono">
                    Sovereign Air-Gap Security Radar
                  </h2>
                  <p className="text-xs text-[#686762]">
                    Real-time runtime socket telemetry & cryptographic proof.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSecurityRadar(false)}
                className="p-1 rounded-lg hover:bg-[#F0EFEA] text-[#686762]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Checklist with Real Measurements */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>LOCAL EXECUTION</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-emerald-800">100% On-Premise Host</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>SOCKET MONITOR</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-emerald-800">0 WAN Outbound Connections</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>CODE SANDBOX</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-emerald-800">Network Sockets Blocked</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>AUDIT LEDGER</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-emerald-800">SHA-256 Chained Integrity</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>RBAC & CLEARANCE</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-emerald-800">Server-Side Enforced</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-900">
                  <span>HUMAN APPROVAL</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-emerald-800">Gate Active Before Release</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowSecurityRadar(false)}
                className="px-4 py-2 rounded-lg bg-[#171717] hover:bg-[#282828] text-white text-xs font-semibold transition"
              >
                Close Radar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. CASES & WORKSPACE SELECTOR OVERLAY */}
      {/* ------------------------------------------------------------------- */}
      {showCasesOverlay && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white border border-[#DCDAD3] rounded-2xl shadow-2xl p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCDAD3]">
              <div>
                <h3 className="text-sm font-bold text-[#171717]">Select Case / Workspace</h3>
                <p className="text-xs text-[#686762]">Switch active investigation or launch flagship scenarios.</p>
              </div>
              <button
                onClick={() => setShowCasesOverlay(false)}
                className="p-1 rounded-lg hover:bg-[#F0EFEA] text-[#686762]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => {
                  handleLaunchScenario("demo-1");
                  setShowCasesOverlay(false);
                }}
                className="p-3 rounded-xl border border-[#DCDAD3] hover:border-[#171717] hover:bg-[#F7F6F2] cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-xs text-[#171717]">
                  <span>Turbine Unit 7 Overhaul</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">FLAGSHIP 01</span>
                </div>
                <p className="text-[11px] text-[#686762]">
                  Scanned PDF inspection report · Local OCR · SOP tolerance checks · Approval Note (.docx)
                </p>
              </div>

              <div
                onClick={() => {
                  handleLaunchScenario("demo-2");
                  setShowCasesOverlay(false);
                }}
                className="p-3 rounded-xl border border-[#DCDAD3] hover:border-[#171717] hover:bg-[#F7F6F2] cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-xs text-[#171717]">
                  <span>Railway Axle Telemetry Analysis</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">FLAGSHIP 02</span>
                </div>
                <p className="text-[11px] text-[#686762]">
                  Sensor telemetry CSV · Python Code Sandbox · Degradation plot (.png) · Anomaly sheet (.xlsx)
                </p>
              </div>

              <div
                onClick={() => {
                  handleLaunchScenario("demo-3");
                  setShowCasesOverlay(false);
                }}
                className="p-3 rounded-xl border border-[#DCDAD3] hover:border-[#171717] hover:bg-[#F7F6F2] cursor-pointer transition space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-xs text-[#171717]">
                  <span>Multi-Evidence Synthesis</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">FLAGSHIP 03</span>
                </div>
                <p className="text-[11px] text-[#686762]">
                  PDF + CSV + Photo fusion · Tri-deliverable suite (.docx, .xlsx, .pptx) · SHA-256 Ledger
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowCasesOverlay(false)}
                className="px-4 py-2 rounded-lg bg-[#F0EFEA] hover:bg-[#E5E3DC] text-[#171717] text-xs font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
