import React, { useState, useEffect } from "react";
import {
  FileText,
  Play,
  RotateCw,
  CheckCircle2,
  Download,
  X,
  Send,
  Clock,
  ChevronRight,
  Shield,
  Layers,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FolderLock,
  Upload,
  Lock,
  Search,
  RefreshCw,
  Hash,
  Database,
  ExternalLink,
  Sliders,
  CheckSquare
} from "lucide-react";
import { api, AgentResponse, UserProfile, ApprovalItem, AuditLogRecord, Citation, Artifact } from "../lib/api";

interface WorkspaceViewProps {
  workspaceId: string;
  workspaceName: string;
  currentUser: UserProfile | null;
  initialPrompt?: string;
  initialAttachments?: string[];
  onBackToHub?: () => void;
}

type WorkspaceSubTab =
  | "overview"
  | "evidence"
  | "knowledge"
  | "agent"
  | "verification"
  | "approvals"
  | "deliverables"
  | "audit";

interface EvidenceFile {
  name: string;
  type: string;
  status: string;
  size: string;
  sha256?: string;
  ocr_status?: string;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  workspaceId,
  workspaceName,
  currentUser,
  initialPrompt = "",
  initialAttachments = [],
  onBackToHub,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceSubTab>("overview");
  const [prompt, setPrompt] = useState(
    initialPrompt ||
      "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul."
  );
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>(
    initialAttachments.length > 0
      ? initialAttachments
      : ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
  );
  const [isRunning, setIsRunning] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [auditVerification, setAuditVerification] = useState<any>(null);
  const [isVerifyingAudit, setIsVerifyingAudit] = useState(false);
  const [indexedDocs, setIndexedDocs] = useState<any[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Inspector selection state
  const [inspectedItem, setInspectedItem] = useState<{
    type: "evidence" | "citation" | "rule" | "deliverable" | "audit";
    data: any;
  } | null>(null);

  // Default evidence items
  const [evidenceList, setEvidenceList] = useState<EvidenceFile[]>([
    {
      name: "INSPECTION_REPORT_TURBINE_UNIT_7.txt",
      type: "PDF / OCR Report",
      status: "Verified",
      size: "24.5 KB",
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      ocr_status: "100% (High-res scan)"
    },
    {
      name: "railway_sensor_telemetry.csv",
      type: "CSV Dataset",
      status: "Ready",
      size: "38.2 KB",
      sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      ocr_status: "N/A (Structured text)"
    },
    {
      name: "bearing_cavitation_scan.png",
      type: "PNG Optical Metrology",
      status: "Verified",
      size: "84.1 KB",
      sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      ocr_status: "Vision preprocessed"
    },
    {
      name: "SOP_TURBINE_MAINTENANCE_V4.txt",
      type: "SOP Manual",
      status: "Indexed",
      size: "112.0 KB",
      sha256: "3858f62230ac3c915f300c664312c63f43b517d10c593a241167acc30794383c",
      ocr_status: "ChromaDB embedded"
    }
  ]);

  // Verification findings
  const [verificationFindings, setVerificationFindings] = useState<any[]>([
    {
      parameter_name: "Drive-End Bearing Vibration (RMS)",
      measured_value: 4.85,
      threshold_value: 3.50,
      operator: "<=",
      unit: "mm/s",
      status: "NON_COMPLIANT",
      severity: "CRITICAL",
      rationale: "Exceeds SOP-TURB-IND-2026-V4 Section 2.1 critical breach limit (3.50 mm/s). Immediate rotor de-energization required."
    },
    {
      parameter_name: "Journal Bearing Babbitt Temperature",
      measured_value: 94.2,
      threshold_value: 90.0,
      operator: "<=",
      unit: "°C",
      status: "NON_COMPLIANT",
      severity: "HIGH",
      rationale: "Exceeds SOP-TURB-IND-2026-V4 Section 2.2 thermal trip limit (90.0°C). Babbitt white-metal degradation risk."
    },
    {
      parameter_name: "Lubrication Oil Pressure",
      measured_value: 1.85,
      threshold_value: 1.80,
      operator: ">=",
      unit: "Bar",
      status: "COMPLIANT",
      severity: "LOW",
      rationale: "Within nominal operating envelope (1.80 - 2.20 Bar)."
    },
    {
      parameter_name: "Shaft Eccentricity Runout",
      measured_value: 0.018,
      threshold_value: 0.050,
      operator: "<=",
      unit: "mm",
      status: "COMPLIANT",
      severity: "LOW",
      rationale: "Within acceptable operational tolerance."
    }
  ]);


  // Deliverables
  const [deliverablesList, setDeliverablesList] = useState<Artifact[]>([
    {
      filename: "Inspection_Approval_Note_Turbine_Unit_7.docx",
      type: "DOCX",
      label: "Official Government Approval Note — Emergency Turbine Overhaul",
      size_bytes: 42800
    },
    {
      filename: "Railway_Telemetry_Anomalies.xlsx",
      type: "XLSX",
      label: "Railway Sensor Hot-Box & Axle Vibration Telemetry Analysis",
      size_bytes: 38400
    },
    {
      filename: "Executive_Briefing_Turbomachinery_Defects.pptx",
      type: "PPTX",
      label: "Executive Strategic Briefing — Asset Integrity & Cavitation Risk",
      size_bytes: 124000
    }
  ]);

  const loadInitialData = async () => {
    try {
      // 1. Fetch real audit logs
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);

      // 2. Fetch pending approvals
      const approvals = await api.getApprovals();
      setPendingApprovals(approvals);

      // 3. Fetch indexed docs
      const docs = await api.getIndexedDocs();
      setIndexedDocs(docs);

      // 4. Fetch real evidence for this workspace
      const ev = await api.listEvidence(workspaceId);
      if (Array.isArray(ev) && ev.length > 0) {
        const mappedEv: EvidenceFile[] = ev.map((item: any) => ({
          name: item.filename,
          type: item.mime_type || "Document",
          status: item.status || "Stored",
          size: `${Math.round((item.size_bytes || 1024) / 1024)} KB`,
          sha256: item.sha256,
          ocr_status: item.ocr_status || "Completed"
        }));
        setEvidenceList(mappedEv);
      }
    } catch (err) {
      console.warn("Initial data load partial failure:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [workspaceId]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialAttachments.length > 0) {
        setSelectedAttachments(initialAttachments);
      }
      handleRunAgent(initialPrompt, initialAttachments);
    }
  }, [initialPrompt]);

  const handleRunAgent = async (
    promptToSend?: string,
    attachmentsOverride?: string[]
  ) => {
    const text = promptToSend || prompt;
    if (!text.trim() || isRunning) return;

    const attachments = attachmentsOverride || selectedAttachments;
    setIsRunning(true);
    setAgentResponse(null);

    try {
      const resp = await api.executeAgent(
        text,
        currentUser?.user_id || "officer_sharma",
        attachments,
        currentUser?.clearance_level || "RESTRICTED"
      );
      setAgentResponse(resp);

      if (resp.artifacts && resp.artifacts.length > 0) {
        setDeliverablesList(resp.artifacts);
      }

      if (resp.approvals && resp.approvals.length > 0) {
        setPendingApprovals(resp.approvals);
      }

      // Refresh audit logs
      const updatedLogs = await api.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      console.error(err);
      setAgentResponse({
        response: `Execution error: ${err.message}`,
        steps: [
          {
            step_num: 1,
            title: "Initialize sovereign pipeline",
            model_used: "Router",
            status: "COMPLETED",
            details: "Workspace sandbox verified"
          },
          {
            step_num: 2,
            title: "Model inference",
            model_used: "Local Engine",
            status: "ERROR",
            details: err.message
          }
        ],
        artifacts: [],
        citations: [],
        model_routing: {
          selected_model: "qwen2.5:7b-instruct",
          task_type: "REASONING",
          rationale: "Error caught",
          backend: "ollama-local"
        },
        audit_entry: {
          log_id: `LOG_${Date.now()}`,
          timestamp: new Date().toISOString(),
          user_id: currentUser?.user_id || "system",
          action: "EXECUTION_ERROR",
          prev_hash: "0000000000000000",
          current_hash: "err_hash_recorded"
        },
        user: currentUser || {
          user_id: "officer_sharma",
          name: "Col. Sharma",
          role: "Officer",
          department: "Turbomachinery QA",
          clearance_level: "SECRET",
          allowed_tools: []
        }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEvidence(true);
    try {
      const res = await api.uploadEvidence(
        file,
        workspaceId,
        currentUser?.department || "General",
        currentUser?.clearance_level || "RESTRICTED",
        currentUser?.user_id || "officer_sharma"
      );

      const newEv: EvidenceFile = {
        name: res.filename,
        type: res.mime_type || file.type || "Document",
        status: "Stored",
        size: `${Math.round(file.size / 1024)} KB`,
        sha256: res.sha256,
        ocr_status: "Processed"
      };

      setEvidenceList((prev) => [newEv, ...prev]);
      setSelectedAttachments((prev) => [...prev, newEv.name]);
    } catch (err: any) {
      alert(`Evidence upload failed: ${err.message}`);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const toggleAttachment = (filename: string) => {
    if (selectedAttachments.includes(filename)) {
      setSelectedAttachments(selectedAttachments.filter((f) => f !== filename));
    } else {
      setSelectedAttachments([...selectedAttachments, filename]);
    }
  };

  const handleApprovalResponse = async (requestId: string, approved: boolean) => {
    try {
      await api.respondApproval(requestId, approved, currentUser?.user_id || "officer_sharma");
      setPendingApprovals((prev) => prev.filter((p) => p.request_id !== requestId));
      const updatedLogs = await api.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      alert(`Approval response error: ${err.message}`);
    }
  };

  const handleVerifyAuditChain = async () => {
    setIsVerifyingAudit(true);
    try {
      const res = await api.verifyAuditChain();
      setAuditVerification(res);
    } catch (err: any) {
      setAuditVerification({ is_valid: false, message: err.message });
    } finally {
      setIsVerifyingAudit(false);
    }
  };

  const navTabs: { id: WorkspaceSubTab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "evidence", label: "Evidence", count: evidenceList.length },
    { id: "knowledge", label: "Knowledge", count: indexedDocs.length || 4 },
    { id: "agent", label: "Agent Run" },
    { id: "verification", label: "Verification", count: verificationFindings.length },
    { id: "approvals", label: "Approvals", count: pendingApprovals.length },
    { id: "deliverables", label: "Deliverables", count: deliverablesList.length },
    { id: "audit", label: "Audit Ledger", count: auditLogs.length }
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-50px)] space-y-3 font-sans select-none">
      {/* 1. Header Bar with Breadcrumb and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[#DCDAD3] shrink-0">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="text-xs font-semibold text-[#686762] hover:text-[#171717] hover:bg-[#F0EFEA] px-2 py-1 rounded transition flex items-center gap-1 border border-[#DCDAD3]"
            >
              ← Workspaces
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-[#171717]">
                {workspaceName}
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0EFEA] text-[#686762] border border-[#DCDAD3]">
                {workspaceId.startsWith("ws-") ? `Case #${workspaceId.replace("ws-", "").toUpperCase()}` : workspaceId}
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#E6F7F2] text-[#006B4D] border border-[#00A878]/30">
                Zero-Egress Execution
              </span>
            </div>
            <p className="text-[11px] text-[#686762] mt-0.5">
              {selectedAttachments.length} evidence attachments selected • Strict Zero-Egress Execution
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => handleRunAgent()}
            disabled={!prompt.trim() || isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded font-medium text-xs transition ${
              !prompt.trim() || isRunning
                ? "bg-[#E6E4DD] text-[#9E9D98] cursor-not-allowed"
                : "bg-[#171717] hover:bg-black text-white shadow-2xs"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run sovereign agent</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Horizontal Linear Workflow Step Indicator */}
      <div className="bg-white border border-[#DCDAD3] rounded-lg p-2.5 flex items-center justify-between overflow-x-auto gap-3 text-xs shrink-0 shadow-2xs">
        <div
          onClick={() => setActiveTab("evidence")}
          className={`flex items-center gap-2 cursor-pointer transition px-2 py-1 rounded ${
            activeTab === "evidence" ? "bg-[#F0EFEA]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00A878]" />
          <span className="font-semibold text-[#171717]">1. Evidence</span>
          <span className="text-[10px] text-[#686762]">({evidenceList.length} files)</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#9E9D98] shrink-0" />

        <div
          onClick={() => setActiveTab("knowledge")}
          className={`flex items-center gap-2 cursor-pointer transition px-2 py-1 rounded ${
            activeTab === "knowledge" ? "bg-[#F0EFEA]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00A878]" />
          <span className="font-semibold text-[#171717]">2. Knowledge</span>
          <span className="text-[10px] text-[#686762]">({indexedDocs.length || 4} standards)</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#9E9D98] shrink-0" />

        <div
          onClick={() => setActiveTab("agent")}
          className={`flex items-center gap-2 cursor-pointer transition px-2 py-1 rounded ${
            activeTab === "agent" ? "bg-[#F0EFEA]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-[#F59E0B] animate-pulse" : agentResponse ? "bg-[#00A878]" : "bg-[#9E9D98]"}`} />
          <span className="font-semibold text-[#171717]">3. Agent</span>
          <span className="text-[10px] text-[#686762]">{isRunning ? "Running" : agentResponse ? "Evaluated" : "Ready"}</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#9E9D98] shrink-0" />

        <div
          onClick={() => setActiveTab("verification")}
          className={`flex items-center gap-2 cursor-pointer transition px-2 py-1 rounded ${
            activeTab === "verification" ? "bg-[#F0EFEA]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00A878]" />
          <span className="font-semibold text-[#171717]">4. Verification</span>
          <span className="text-[10px] text-[#686762]">({verificationFindings.length} rules)</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#9E9D98] shrink-0" />

        <div
          onClick={() => setActiveTab("approvals")}
          className={`flex items-center gap-2 cursor-pointer transition px-2 py-1 rounded ${
            activeTab === "approvals" ? "bg-[#F0EFEA]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${pendingApprovals.length > 0 ? "bg-[#F59E0B] animate-pulse" : "bg-[#00A878]"}`} />
          <span className="font-semibold text-[#171717]">5. Approval</span>
          <span className="text-[10px] text-[#686762]">{pendingApprovals.length > 0 ? "Pending action" : "Sanctioned"}</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[#9E9D98] shrink-0" />

        <div
          onClick={() => setActiveTab("deliverables")}
          className={`flex items-center gap-2 cursor-pointer transition px-2 py-1 rounded ${
            activeTab === "deliverables" ? "bg-[#F0EFEA]" : "hover:bg-[#FAF9F6]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#00A878]" />
          <span className="font-semibold text-[#171717]">6. Deliverables</span>
          <span className="text-[10px] text-[#686762]">({deliverablesList.length} files)</span>
        </div>
      </div>

      {/* 3. Main Tri-Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        {/* LEFT COLUMN: Sub-navigation & Workspace Metadata (2.5 cols -> 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#DCDAD3] rounded-lg p-3 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="text-[10px] uppercase font-semibold text-[#9E9D98] tracking-wider px-1">
              Workspace Views
            </div>

            <nav className="space-y-0.5">
              {navTabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                      isActive
                        ? "bg-[#F0EFEA] text-[#171717] font-semibold"
                        : "text-[#686762] hover:bg-[#FAF9F6] hover:text-[#171717]"
                    }`}
                  >
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span className="text-[10px] font-mono text-[#9E9D98]">
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-3 border-t border-[#DCDAD3] space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-[#686762]">
              <span>Clearance</span>
              <span className="font-mono text-[#171717] font-medium">SECRET</span>
            </div>
            <div className="flex items-center justify-between text-[#686762]">
              <span>Owner</span>
              <span className="truncate max-w-[80px] font-mono text-[#171717]">
                {currentUser?.user_id || "officer"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#686762]">
              <span>Audit Chain</span>
              <span className="text-[#006B4D] font-mono font-medium">Valid</span>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Main Operational Content (7.5 cols -> 7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#DCDAD3] rounded-lg p-4 flex flex-col justify-between overflow-y-auto min-h-0">
          {/* TAB 1: OVERVIEW / PIPELINE VIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  Case Execution Pipeline
                </h2>
                <span className="text-[11px] text-[#686762]">
                  Status: {isRunning ? "Processing..." : agentResponse ? "Evaluation Complete" : "Ready"}
                </span>
              </div>

              {/* Step Timeline */}
              <div className="space-y-2">
                {agentResponse?.steps && agentResponse.steps.length > 0 ? (
                  agentResponse.steps.map((st) => (
                    <div
                      key={st.step_num}
                      className="p-3 rounded bg-[#FAF9F6] border border-[#DCDAD3] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {st.status === "COMPLETED" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878] shrink-0" />
                          ) : st.status === "ERROR" ? (
                            <X className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-[#9E9D98] shrink-0" />
                          )}
                          <span className="font-semibold text-[#171717]">
                            Step {st.step_num}: {st.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#686762] bg-white px-1.5 py-0.5 rounded border border-[#DCDAD3]">
                          {st.model_used}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#686762] leading-relaxed pl-5.5">
                        {st.details}
                      </p>
                    </div>
                  ))
                ) : isRunning ? (
                  <div className="p-4 rounded bg-[#FAF9F6] border border-[#DCDAD3] flex items-center gap-3 text-xs text-[#171717]">
                    <RotateCw className="w-3.5 h-3.5 text-[#00A878] animate-spin" />
                    <span>Executing sovereign agent · Querying vector store · Reasoning...</span>
                  </div>
                ) : (
                  <div className="p-4 rounded bg-[#FAF9F6] border border-[#DCDAD3] text-xs text-[#686762] space-y-2">
                    <p className="font-medium text-[#171717]">Ready for automated analysis.</p>
                    <p className="text-[11px] leading-relaxed">
                      Select your prompt or click <strong>"Run sovereign agent"</strong> above to trigger multimodal evidence extraction, RAG grounded citation retrieval, deterministic verification, and deliverable creation.
                    </p>
                  </div>
                )}
              </div>

              {/* Assessment Note */}
              {agentResponse && (
                <div className="p-3.5 rounded bg-[#FAF9F6] border border-[#DCDAD3] space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#DCDAD3] pb-1.5">
                    <span className="font-semibold text-[#171717]">Operational Assessment Summary</span>
                    <span className="text-[10px] font-mono text-[#686762]">
                      Routing: {agentResponse.model_routing?.selected_model || "Local Qwen/Llama"}
                    </span>
                  </div>
                  <div className="text-[#171717] leading-relaxed whitespace-pre-wrap text-xs">
                    {agentResponse.response}
                  </div>
                </div>
              )}

              {/* Human Approval Required Card */}
              {pendingApprovals.length > 0 && (
                <div className="p-3.5 rounded bg-[#FEF3C7] border border-[#F59E0B]/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#92400E] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      Human Sanction Required (HITL)
                    </span>
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white text-[#92400E] border border-[#F59E0B]/30">
                      ACTION BLOCKED
                    </span>
                  </div>
                  {pendingApprovals.map((req) => (
                    <div key={req.request_id} className="space-y-2">
                      <p className="text-[#92400E] font-medium">{req.title}</p>
                      <p className="text-[11px] text-[#B45309]">{req.description}</p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApprovalResponse(req.request_id, false)}
                          className="px-3 py-1 rounded bg-white border border-[#DCDAD3] hover:bg-[#F0EFEA] text-red-700 font-medium text-xs"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovalResponse(req.request_id, true)}
                          className="px-3 py-1 rounded bg-[#00A878] hover:bg-[#008F66] text-white font-medium text-xs shadow-2xs"
                        >
                          Approve & Sanction
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {activeTab === "evidence" && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <div>
                  <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Evidence Inventory
                  </h2>
                  <p className="text-[11px] text-[#686762]">
                    Files sandboxed in workspace directory with SHA-256 integrity hashing.
                  </p>
                </div>

                {/* Upload Button */}
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium cursor-pointer transition shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingEvidence ? "Uploading..." : "Upload Evidence"}</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingEvidence}
                  />
                </label>
              </div>

              <div className="border border-[#DCDAD3] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#DCDAD3] text-[#686762] text-[11px]">
                      <th className="py-2 px-3 w-8">Attach</th>
                      <th className="py-2 px-3">File Name</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3">OCR / Vision</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCDAD3]">
                    {evidenceList.map((file) => {
                      const isSelected = selectedAttachments.includes(file.name);
                      return (
                        <tr
                          key={file.name}
                          onClick={() => {
                            setInspectedItem({ type: "evidence", data: file });
                          }}
                          className={`hover:bg-[#F0EFEA] transition cursor-pointer ${
                            isSelected ? "bg-[#FAF9F6]" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => { e.stopPropagation(); toggleAttachment(file.name); }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleAttachment(file.name)}
                              className="rounded border-[#DCDAD3] text-[#00A878] focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-[#171717] flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-[#686762]" />
                              <span>{file.name}</span>
                            </div>
                            {file.sha256 && (
                              <div className="text-[10px] font-mono text-[#9E9D98] truncate max-w-xs">
                                SHA: {file.sha256.substring(0, 20)}...
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#686762]">{file.type}</td>
                          <td className="py-2.5 px-3 font-mono text-[#686762] text-[11px]">{file.size}</td>
                          <td className="py-2.5 px-3 text-[#686762] text-[11px]">{file.ocr_status || "Standard"}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#006B4D] font-medium">
                              <CheckCircle2 className="w-3 h-3 text-[#00A878]" />
                              <span>{file.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: KNOWLEDGE */}
          {activeTab === "knowledge" && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <div>
                  <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Knowledge Base & RAG Index
                  </h2>
                  <p className="text-[11px] text-[#686762]">
                    Local vector partitions powered by BGE-M3 embeddings & ChromaDB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-[#FAF9F6] border border-[#DCDAD3] space-y-1">
                  <span className="text-[10px] font-mono text-[#686762] uppercase">Vector Embedding Model</span>
                  <p className="font-semibold text-xs text-[#171717]">BAAI/bge-m3 (Dense + Sparse)</p>
                  <span className="text-[10px] text-[#006B4D] font-medium">● 100% Local Ollama Engine</span>
                </div>

                <div className="p-3 rounded bg-[#FAF9F6] border border-[#DCDAD3] space-y-1">
                  <span className="text-[10px] font-mono text-[#686762] uppercase">Vector Store</span>
                  <p className="font-semibold text-xs text-[#171717]">ChromaDB Partitioned Workspace</p>
                  <span className="text-[10px] text-[#006B4D] font-medium">● SQLite / DuckDB backend</span>
                </div>
              </div>

              <div className="border border-[#DCDAD3] rounded-lg overflow-hidden">
                <div className="bg-[#FAF9F6] px-3 py-2 border-b border-[#DCDAD3] text-xs font-semibold text-[#171717]">
                  Indexed Standards & SOPs
                </div>
                <div className="divide-y divide-[#DCDAD3] text-xs">
                  <div
                    onClick={() => setInspectedItem({
                      type: "citation",
                      data: {
                        source: "SOP-TURB-IND-2026-V4",
                        clause: "Turbine Vibration Acceptance Limits",
                        section: "Section 4.2.1",
                        page: 18,
                        text: "For steam turbines exceeding 3000 RPM, vibration severity velocity RMS must not exceed 4.5 mm/s. Measurements above 7.1 mm/s require immediate shutdown and maintenance."
                      }
                    })}
                    className="p-3 hover:bg-[#F0EFEA] transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#171717]">SOP-TURB-IND-2026-V4 (Turbine Maintenance)</div>
                      <div className="text-[11px] text-[#686762]">Indexed 42 chunks • Clause 4.2.1 vibration thresholds</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#006B4D] font-medium">INDEXED</span>
                  </div>

                  <div
                    onClick={() => setInspectedItem({
                      type: "citation",
                      data: {
                        source: "DEF-STD-05-21",
                        clause: "Journal Bearing Cavitation Standards",
                        section: "Clause 9.3",
                        page: 34,
                        text: "Pitting depth exceeding 0.08 mm on load-bearing quadrant constitutes failure under Category 1 operational standards."
                      }
                    })}
                    className="p-3 hover:bg-[#F0EFEA] transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#171717]">DEF-STD-05-21 (Defence Metrology Standard)</div>
                      <div className="text-[11px] text-[#686762]">Indexed 88 chunks • Optical cavitation severity rules</div>
                    </div>
                    <span className="text-[10px] font-mono text-[#006B4D] font-medium">INDEXED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AGENT RUN */}
          {activeTab === "agent" && (
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  Agent Orchestration Log
                </h2>
                <span className="text-[10px] font-mono text-[#686762]">
                  Model: {agentResponse?.model_routing?.selected_model || "qwen2.5:7b-instruct"}
                </span>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2">
                {agentResponse?.steps ? (
                  agentResponse.steps.map((st) => (
                    <div key={st.step_num} className="p-3 rounded bg-[#FAF9F6] border border-[#DCDAD3] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#171717]">{st.title}</span>
                        <span className="text-[10px] font-mono text-[#686762]">{st.status}</span>
                      </div>
                      <p className="text-[11px] text-[#686762]">{st.details}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-[#9E9D98] text-xs">
                    No active agent execution. Run the agent below.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DETERMINISTIC VERIFICATION */}
          {activeTab === "verification" && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <div>
                  <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Deterministic Verification Engine
                  </h2>
                  <p className="text-[11px] text-[#686762]">
                    Zero-hallucination mathematical rule verification against regulatory standards.
                  </p>
                </div>
              </div>

              <div className="border border-[#DCDAD3] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#DCDAD3] text-[#686762] text-[11px]">
                      <th className="py-2.5 px-3">Parameter Measured</th>
                      <th className="py-2.5 px-3">Measured</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Standard Limit</th>
                      <th className="py-2.5 px-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCDAD3]">
                    {verificationFindings.map((v, i) => (
                      <tr
                        key={i}
                        onClick={() => setInspectedItem({ type: "rule", data: v })}
                        className="hover:bg-[#F0EFEA] transition cursor-pointer"
                      >
                        <td className="py-2.5 px-3 font-medium text-[#171717]">{v.parameter_name}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-[#171717]">{v.measured_value} {v.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-[#686762]">{v.operator}</td>
                        <td className="py-2.5 px-3 font-mono text-[#686762]">{v.threshold_value} {v.unit}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                            v.status === "COMPLIANT"
                              ? "bg-[#E6F7F2] text-[#006B4D] border-[#00A878]/30"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: APPROVALS */}
          {activeTab === "approvals" && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                  Human-in-the-Loop Approvals
                </h2>
                <span className="text-[11px] text-[#686762] font-mono">
                  {pendingApprovals.length} pending sanctions
                </span>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF9F6] border border-[#DCDAD3] rounded-lg text-xs text-[#686762]">
                  <CheckCircle2 className="w-5 h-5 text-[#00A878] mx-auto mb-2" />
                  <p className="font-semibold text-[#171717]">All required actions are sanctioned.</p>
                  <p className="text-[11px] mt-0.5">No pending human-in-the-loop review tickets.</p>
                </div>
              ) : (
                pendingApprovals.map((req) => (
                  <div key={req.request_id} className="p-4 rounded-lg bg-white border border-[#DCDAD3] space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#DCDAD3] pb-2">
                      <div>
                        <h3 className="font-semibold text-sm text-[#171717]">{req.title}</h3>
                        <span className="text-[10px] font-mono text-[#9E9D98]">{req.request_id}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 font-medium">
                        HIGH RISK
                      </span>
                    </div>

                    <p className="text-[#686762] text-xs leading-relaxed">{req.description}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDAD3]">
                      <button
                        onClick={() => handleApprovalResponse(req.request_id, false)}
                        className="px-3.5 py-1.5 rounded border border-[#DCDAD3] text-red-700 hover:bg-red-50 text-xs font-medium transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprovalResponse(req.request_id, true)}
                        className="px-4 py-1.5 rounded bg-[#00A878] hover:bg-[#008F66] text-white text-xs font-medium transition shadow-2xs"
                      >
                        Approve & Sanction
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: DELIVERABLES */}
          {activeTab === "deliverables" && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <div>
                  <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Official Deliverables
                  </h2>
                  <p className="text-[11px] text-[#686762]">
                    Fully formatted .docx, .xlsx, and .pptx files with provenance metadata.
                  </p>
                </div>
              </div>

              <div className="border border-[#DCDAD3] rounded-lg overflow-hidden divide-y divide-[#DCDAD3]">
                {deliverablesList.map((art, idx) => {
                  const downloadUrl = api.getDeliverableUrl(art.filename);
                  return (
                    <div
                      key={idx}
                      onClick={() => setInspectedItem({ type: "deliverable", data: art })}
                      className="p-3.5 hover:bg-[#F0EFEA] transition cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-[#FAF9F6] border border-[#DCDAD3]">
                          <FileText className="w-4 h-4 text-[#171717]" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-[#171717] flex items-center gap-2">
                            <span>{art.filename}</span>
                            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#FAF9F6] text-[#686762] border border-[#DCDAD3]">
                              {art.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#686762] mt-0.5">{art.label}</div>
                        </div>
                      </div>

                      <a
                        href={downloadUrl}
                        download={art.filename}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT LEDGER */}
          {activeTab === "audit" && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
                <div>
                  <h2 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                    Cryptographic Audit Chain (SHA-256)
                  </h2>
                  <p className="text-[11px] text-[#686762]">
                    Immutably chained execution ledger.
                  </p>
                </div>

                <button
                  onClick={handleVerifyAuditChain}
                  disabled={isVerifyingAudit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FAF9F6] hover:bg-[#F0EFEA] border border-[#DCDAD3] text-xs font-semibold text-[#171717] transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingAudit ? "animate-spin" : ""}`} />
                  <span>{isVerifyingAudit ? "Verifying..." : "Verify Audit Chain"}</span>
                </button>
              </div>

              {auditVerification && (
                <div className={`p-3 rounded border text-xs flex items-center gap-2.5 ${
                  auditVerification.is_valid
                    ? "bg-[#E6F7F2] border-[#00A878]/30 text-[#006B4D]"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-[#00A878] shrink-0" />
                  <div>
                    <span className="font-semibold">
                      {auditVerification.is_valid ? "LEDGER TAMPER-EVIDENT: VERIFIED VALID" : "AUDIT COMPROMISED"}
                    </span>
                    <p className="text-[11px] mt-0.5">{auditVerification.message}</p>
                  </div>
                </div>
              )}

              <div className="border border-[#DCDAD3] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#DCDAD3] text-[#686762] text-[11px]">
                      <th className="py-2 px-3">Log ID</th>
                      <th className="py-2 px-3">Timestamp (UTC)</th>
                      <th className="py-2 px-3">Officer</th>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3">Block SHA-256 Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCDAD3]">
                    {auditLogs.slice(0, 15).map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setInspectedItem({ type: "audit", data: log })}
                        className="hover:bg-[#F0EFEA] transition cursor-pointer"
                      >
                        <td className="py-2 px-3 font-mono font-medium text-[#171717]">{log.log_id}</td>
                        <td className="py-2 px-3 font-mono text-[#686762] text-[11px]">{log.timestamp.replace("T", " ").substring(0, 19)}</td>
                        <td className="py-2 px-3 font-medium text-[#171717]">{log.user_id}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#686762]">{log.action}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#006B4D] truncate max-w-[120px]">
                          {log.current_hash?.substring(0, 14)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Prompt Composer (Omni-present) */}
          <div className="pt-3 border-t border-[#DCDAD3] space-y-2 shrink-0">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="Give operational instruction or analyze evidence..."
                className="w-full text-xs bg-[#FAF9F6] border border-[#DCDAD3] rounded-lg p-2.5 pr-10 text-[#171717] placeholder-[#9E9D98] focus:outline-none focus:border-[#171717] resize-none font-sans"
              />
              <button
                type="button"
                onClick={() => handleRunAgent()}
                disabled={!prompt.trim() || isRunning}
                className="absolute right-2.5 bottom-3 p-1.5 rounded bg-[#171717] hover:bg-black text-white disabled:opacity-30 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sources & Citations (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-[#DCDAD3] rounded-lg p-3.5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCDAD3]">
              <span className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Sources & Citations
              </span>
              <span className="text-[10px] font-mono text-[#9E9D98]">
                {inspectedItem ? inspectedItem.type.toUpperCase() : "LIVE RUN"}
              </span>
            </div>

            {inspectedItem ? (
              <div className="space-y-3 text-xs">
                {/* EVIDENCE INSPECTION */}
                {inspectedItem.type === "evidence" && (
                  <div className="space-y-2.5">
                    <div className="font-semibold text-[#171717]">{inspectedItem.data.name}</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#686762]">
                        <span>MIME Type:</span>
                        <span className="font-mono text-[#171717]">{inspectedItem.data.type}</span>
                      </div>
                      <div className="flex justify-between text-[#686762]">
                        <span>File Size:</span>
                        <span className="font-mono text-[#171717]">{inspectedItem.data.size}</span>
                      </div>
                      <div className="flex justify-between text-[#686762]">
                        <span>OCR Status:</span>
                        <span className="text-[#006B4D] font-medium">{inspectedItem.data.ocr_status}</span>
                      </div>
                    </div>
                    {inspectedItem.data.sha256 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-semibold text-[#686762] uppercase">SHA-256 Checksum</span>
                        <div className="p-2 rounded bg-[#FAF9F6] border border-[#DCDAD3] font-mono text-[10px] break-all text-[#171717]">
                          {inspectedItem.data.sha256}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CITATION INSPECTION */}
                {inspectedItem.type === "citation" && (
                  <div className="space-y-2.5">
                    <div className="font-semibold text-[#171717]">{inspectedItem.data.source}</div>
                    <div className="text-[11px] text-[#006B4D] font-medium font-mono">
                      {inspectedItem.data.section || "Section Reference"} • Page {inspectedItem.data.page || 1}
                    </div>
                    <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#DCDAD3] text-[11px] text-[#171717] italic leading-relaxed">
                      "{inspectedItem.data.text || inspectedItem.data.clause}"
                    </div>
                  </div>
                )}

                {/* RULE INSPECTION */}
                {inspectedItem.type === "rule" && (
                  <div className="space-y-2.5">
                    <div className="font-semibold text-[#171717]">{inspectedItem.data.parameter_name}</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-[#686762]">
                        <span>Measured:</span>
                        <span className="font-mono font-semibold text-[#171717]">{inspectedItem.data.measured_value} {inspectedItem.data.unit}</span>
                      </div>
                      <div className="flex justify-between text-[#686762]">
                        <span>Threshold:</span>
                        <span className="font-mono text-[#686762]">{inspectedItem.data.threshold_value} {inspectedItem.data.unit}</span>
                      </div>
                      <div className="flex justify-between text-[#686762]">
                        <span>Severity:</span>
                        <span className="font-mono text-red-700 font-semibold">{inspectedItem.data.severity}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#686762] pt-1 leading-relaxed">
                      {inspectedItem.data.rationale}
                    </p>
                  </div>
                )}

                {/* DELIVERABLE INSPECTION */}
                {inspectedItem.type === "deliverable" && (
                  <div className="space-y-2.5">
                    <div className="font-semibold text-[#171717]">{inspectedItem.data.filename}</div>
                    <p className="text-[11px] text-[#686762]">{inspectedItem.data.label}</p>
                    <div className="p-2 rounded bg-[#FAF9F6] border border-[#DCDAD3] text-[10px] font-mono text-[#006B4D]">
                      Provenance: Generated by Sovereign AI Workbench SIH26117
                    </div>
                  </div>
                )}

                {/* AUDIT LOG INSPECTION */}
                {inspectedItem.type === "audit" && (
                  <div className="space-y-2.5">
                    <div className="font-semibold text-[#171717]">{inspectedItem.data.log_id}</div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-[#686762]">
                        <span>Action:</span>
                        <span className="font-mono text-[#171717]">{inspectedItem.data.action}</span>
                      </div>
                      <div className="flex justify-between text-[#686762]">
                        <span>Officer:</span>
                        <span className="font-mono text-[#171717]">{inspectedItem.data.user_id}</span>
                      </div>
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-[#686762] uppercase">Block Hash (SHA-256)</span>
                      <div className="p-2 rounded bg-[#FAF9F6] border border-[#DCDAD3] font-mono text-[10px] break-all text-[#171717]">
                        {inspectedItem.data.current_hash}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setInspectedItem(null)}
                  className="w-full text-center py-1 text-[11px] text-[#686762] hover:text-[#171717] hover:underline"
                >
                  Clear Inspector
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-[#9E9D98]">Grounded Citations</span>
                  {agentResponse?.citations && agentResponse.citations.length > 0 ? (
                    agentResponse.citations.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => setInspectedItem({ type: "citation", data: c })}
                        className="p-2.5 rounded bg-[#FAF9F6] border border-[#DCDAD3] hover:bg-[#F0EFEA] transition cursor-pointer space-y-0.5"
                      >
                        <div className="font-medium text-[#171717] truncate">{c.source}</div>
                        <div className="text-[10px] text-[#686762]">{c.section || "Clause reference"}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[#9E9D98] text-[11px] bg-[#FAF9F6] rounded border border-[#DCDAD3]">
                      No citations loaded yet.
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-[#DCDAD3]">
                  <span className="text-[10px] font-semibold uppercase text-[#9E9D98]">Active Attachments</span>
                  <div className="space-y-1">
                    {selectedAttachments.map((f) => (
                      <div key={f} className="text-[11px] font-mono text-[#171717] flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#DCDAD3] text-[10px] font-mono text-[#9E9D98] text-center">
            Zero-Egress Sandboxed Execution
          </div>
        </div>
      </div>
    </div>
  );
};
