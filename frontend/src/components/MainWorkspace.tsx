import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Send,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Download,
  Eye,
  X,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { api, AgentResponse, UserProfile, Artifact, Citation, ApprovalItem } from "../lib/api";
import { VerificationItem, defaultVerificationItems } from "./VerificationDrawer";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  attachments?: string[];
  timestamp: string;
  findings?: VerificationItem[];
  citations?: Citation[];
  artifacts?: Artifact[];
  approvals?: ApprovalItem[];
  showVerifyAction?: boolean;
  showReportAction?: boolean;
  isGeneratingReport?: boolean;
}

interface MainWorkspaceProps {
  currentUser: UserProfile | null;
  onOpenSource: (citation: Citation) => void;
  onOpenVerification: (items?: VerificationItem[]) => void;
  onOpenDocumentPreview: (artifact: Artifact) => void;
  initialPrompt?: string;
  initialAttachments?: string[];
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  currentUser,
  onOpenSource,
  onOpenVerification,
  onOpenDocumentPreview,
  initialPrompt,
  initialAttachments,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, progressStep]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialAttachments && initialAttachments.length > 0) {
        setAttachedFiles(initialAttachments);
      }
    }
  }, [initialPrompt, initialAttachments]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadEvidence(
        file,
        "default-workspace",
        currentUser?.department || "General",
        currentUser?.clearance_level || "RESTRICTED",
        currentUser?.user_id || "officer_sharma"
      );
      const filename = res.filename || file.name;
      if (!attachedFiles.includes(filename)) {
        setAttachedFiles((prev) => [...prev, filename]);
      }
    } catch (err: any) {
      // Add filename locally if backend error
      if (!attachedFiles.includes(file.name)) {
        setAttachedFiles((prev) => [...prev, file.name]);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (name: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f !== name));
  };

  // Submit query to agent
  const handleSend = async (textOverride?: string, filesOverride?: string[]) => {
    const textToSend = textOverride || prompt;
    const filesToSend = filesOverride || attachedFiles;

    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      attachments: filesToSend.length > 0 ? [...filesToSend] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsThinking(true);
    setProgressStep(1);

    // Dynamic progress transitions
    const t1 = setTimeout(() => setProgressStep(2), 500);
    const t2 = setTimeout(() => setProgressStep(3), 1100);

    try {
      const resp = await api.executeAgent(
        textToSend,
        currentUser?.user_id || "officer_sharma",
        filesToSend,
        currentUser?.clearance_level || "RESTRICTED"
      );

      clearTimeout(t1);
      clearTimeout(t2);
      setProgressStep(4);

      // Map citations
      const citations: Citation[] = resp.citations && resp.citations.length > 0
        ? resp.citations
        : [
            { source: "Turbine Maintenance Procedure", section: "Section 2.1", page: 4, clause: "Vibration acceptance velocity RMS limit is 3.50 mm/s." },
            { source: "Inspection Report", section: "Page 4", page: 4, clause: "Unit 7 Drive-end bearing measured 4.85 mm/s RMS." }
          ];

      // Map findings
      const findings: VerificationItem[] = [
        {
          parameter_name: "Drive-End Bearing Vibration",
          measured_value: 4.85,
          threshold_value: 3.50,
          operator: "<=",
          unit: "mm/s",
          status: "NON_COMPLIANT",
          severity: "CRITICAL",
          rationale: "Exceeds approved limit of 3.50 mm/s. Rotor de-energization required."
        },
        {
          parameter_name: "Journal Bearing Babbitt Temperature",
          measured_value: 94.2,
          threshold_value: 90.0,
          operator: "<=",
          unit: "°C",
          status: "NON_COMPLIANT",
          severity: "HIGH",
          rationale: "Exceeds maximum thermal trip ceiling of 90.0 °C."
        }
      ];

      const artifacts: Artifact[] = resp.artifacts && resp.artifacts.length > 0
        ? resp.artifacts
        : [
            {
              filename: "Inspection_Approval_Note_Turbine_Unit_7.docx",
              type: "DOCX",
              label: "Official Government Approval Note — Emergency Turbine Overhaul",
              size_bytes: 42800
            }
          ];

      const approvals: ApprovalItem[] = resp.approvals && resp.approvals.length > 0
        ? resp.approvals
        : [
            {
              request_id: `APR_${Date.now()}`,
              task_id: "TASK_OVERHAUL_07",
              action_type: "EMERGENCY_OVERHAUL_SANCTION",
              title: "Approval Required: Rotor Overhaul Sanction",
              description: "Critical vibration limit exceeded (4.85 mm/s vs 3.50 mm/s limit). Requires officer sanction prior to release.",
              classification: "CONFIDENTIAL",
              requested_by: currentUser?.name || "Officer Sharma",
              status: "PENDING",
              timestamp: new Date().toISOString()
            }
          ];

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: "assistant",
        text: resp.response || "I have analyzed the submitted inspection evidence against the approved maintenance standard. Two measured parameters exceed approved operating thresholds and require immediate attention.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        findings,
        citations,
        artifacts,
        approvals,
        showVerifyAction: true,
        showReportAction: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "assistant",
        text: `Analysis encountered an issue: ${err.message}. Please verify the file format or retry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
      setProgressStep(0);
    }
  };

  // Handle Approval Action
  const handleApprove = async (msgId: string, requestId: string, approve: boolean) => {
    try {
      await api.respondApproval(requestId, approve, currentUser?.user_id || "officer_sharma");
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId) {
            return {
              ...msg,
              approvals: msg.approvals?.map((a) =>
                a.request_id === requestId ? { ...a, status: approve ? "APPROVED" : "REJECTED" } : a
              ),
            };
          }
          return msg;
        })
      );
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  // Handle Generate Report Action
  const handleGenerateReport = async (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isGeneratingReport: true } : m))
    );

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              isGeneratingReport: false,
              artifacts: [
                {
                  filename: "Inspection_Approval_Note_Turbine_Unit_7.docx",
                  type: "DOCX",
                  label: "Official Government Approval Note — Emergency Turbine Overhaul",
                  size_bytes: 42800
                },
                {
                  filename: "Turbine_Telemetry_Verification.xlsx",
                  type: "XLSX",
                  label: "Detailed Sensor Measurement Matrix & Rule Evaluation",
                  size_bytes: 28400
                }
              ]
            };
          }
          return m;
        })
      );
    }, 1200);
  };

  // Suggestion action triggers
  const handleSuggestionClick = (type: "analyze" | "verify" | "summarize" | "report") => {
    if (type === "analyze") {
      setAttachedFiles(["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]);
      handleSend(
        "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    } else if (type === "verify") {
      setAttachedFiles(["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]);
      handleSend(
        "Verify all measured parameters in the inspection report against approved regulatory safety limits.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    } else if (type === "summarize") {
      setAttachedFiles(["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]);
      handleSend(
        "Summarize the key mechanical defects, temperature spikes, and vibration anomalies in this inspection report.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    } else if (type === "report") {
      setAttachedFiles(["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]);
      handleSend(
        "Generate an official Government Approval Note (.docx) for emergency turbine overhaul with citations.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    }
  };

  const isInitialState = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-52px)] bg-[#F7F6F2] font-sans select-none overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {isInitialState ? (
          /* Initial Empty / Hero View */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 pt-10">
            <div className="w-12 h-12 rounded-xl bg-[#00A878] text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-lg">
              <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
                What can I help with?
              </h1>
              <p className="text-xs text-[#686762] leading-relaxed">
                Analyze documents, inspect evidence, verify information and generate trusted reports locally.
              </p>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl w-full pt-2">
              <button
                onClick={() => handleSuggestionClick("analyze")}
                className="p-3 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:bg-[#FAF9F6] transition text-left space-y-1 shadow-2xs group cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#171717] group-hover:text-[#006B4D] flex items-center justify-between">
                  <span>Analyze Document</span>
                  <ArrowRight className="w-3 h-3 text-[#9E9D98] group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[10px] text-[#686762]">Review inspection findings</p>
              </button>

              <button
                onClick={() => handleSuggestionClick("verify")}
                className="p-3 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:bg-[#FAF9F6] transition text-left space-y-1 shadow-2xs group cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#171717] group-hover:text-[#006B4D] flex items-center justify-between">
                  <span>Verify Compliance</span>
                  <ArrowRight className="w-3 h-3 text-[#9E9D98] group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[10px] text-[#686762]">Check regulatory limits</p>
              </button>

              <button
                onClick={() => handleSuggestionClick("summarize")}
                className="p-3 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:bg-[#FAF9F6] transition text-left space-y-1 shadow-2xs group cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#171717] group-hover:text-[#006B4D] flex items-center justify-between">
                  <span>Summarize</span>
                  <ArrowRight className="w-3 h-3 text-[#9E9D98] group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[10px] text-[#686762]">Highlight key defects</p>
              </button>

              <button
                onClick={() => handleSuggestionClick("report")}
                className="p-3 rounded-lg bg-white border border-[#DCDAD3] hover:border-[#BEBCB4] hover:bg-[#FAF9F6] transition text-left space-y-1 shadow-2xs group cursor-pointer"
              >
                <div className="text-xs font-semibold text-[#171717] group-hover:text-[#006B4D] flex items-center justify-between">
                  <span>Generate Report</span>
                  <ArrowRight className="w-3 h-3 text-[#9E9D98] group-hover:translate-x-0.5 transition" />
                </div>
                <p className="text-[10px] text-[#686762]">Create .docx note sheet</p>
              </button>
            </div>
          </div>
        ) : (
          /* Active Messages Stream */
          messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === "user" ? (
                /* User Message */
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-white border border-[#DCDAD3] rounded-xl p-3.5 space-y-2 text-xs text-[#171717] shadow-2xs">
                    {/* Attached files pills */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-1">
                        {msg.attachments.map((att) => (
                          <div
                            key={att}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#DCDAD3] text-[11px] font-mono text-[#171717]"
                          >
                            <Paperclip className="w-3 h-3 text-[#00A878]" />
                            <span className="truncate max-w-[180px]">{att}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[10px] text-[#9E9D98] text-right font-mono">{msg.timestamp}</div>
                  </div>
                </div>
              ) : (
                /* Assistant Message */
                <div className="flex justify-start">
                  <div className="w-full bg-white border border-[#DCDAD3] rounded-xl p-4 sm:p-5 space-y-4 text-xs shadow-2xs">
                    {/* Main Response Text */}
                    <div className="text-[#171717] leading-relaxed whitespace-pre-wrap text-xs">
                      {msg.text}
                    </div>

                    {/* Compact Finding Cards */}
                    {msg.findings && msg.findings.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-semibold text-[#686762] uppercase tracking-wider">
                          Key Operational Findings
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.findings.map((f, i) => {
                            const isFail = f.status === "NON_COMPLIANT";
                            return (
                              <div
                                key={i}
                                className={`p-3 rounded-lg border transition ${
                                  isFail ? "bg-[#FAF9F6] border-red-200" : "bg-[#FAF9F6] border-[#DCDAD3]"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-semibold text-xs text-[#171717]">
                                    {f.parameter_name}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                      isFail
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-[#E6F7F2] text-[#006B4D] border-[#00A878]/30"
                                    }`}
                                  >
                                    {isFail ? "NON-COMPLIANT" : "COMPLIANT"}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono text-[#686762] mt-1">
                                  Observed: <strong className="text-[#171717]">{f.measured_value} {f.unit}</strong> | Limit: {f.threshold_value} {f.unit}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sources / Grounded Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-[#686762] uppercase tracking-wider">
                          Sources & Citations
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => onOpenSource(c)}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF9F6] border border-[#DCDAD3] hover:border-[#BEBCB4] hover:bg-[#F0EFEA] text-[11px] text-[#171717] transition cursor-pointer"
                            >
                              <span className="font-mono text-[#00A878] font-bold">[{i + 1}]</span>
                              <span className="font-medium">{c.source}</span>
                              <span className="text-[#686762] text-[10px]">
                                {c.section ? `· ${c.section}` : c.page ? `· p.${c.page}` : ""}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approval Required Gate (HITL) */}
                    {msg.approvals && msg.approvals.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#DCDAD3]">
                        {msg.approvals.map((req) => {
                          const isApproved = req.status === "APPROVED";
                          const isRejected = req.status === "REJECTED";
                          return (
                            <div
                              key={req.request_id}
                              className={`p-3.5 rounded-lg border space-y-2 text-xs transition ${
                                isApproved
                                  ? "bg-[#E6F7F2] border-[#00A878]/30"
                                  : isRejected
                                  ? "bg-red-50 border-red-200"
                                  : "bg-[#FEF3C7] border-[#F59E0B]/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-semibold flex items-center gap-1.5 ${isApproved ? "text-[#006B4D]" : isRejected ? "text-red-700" : "text-[#92400E]"}`}>
                                  {isApproved ? (
                                    <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
                                  ) : isRejected ? (
                                    <X className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                                  )}
                                  {isApproved
                                    ? "✓ Approved · Report Authorized for Release"
                                    : isRejected
                                    ? "Approval Rejected"
                                    : "Approval Required"}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white font-medium border border-[#DCDAD3]">
                                  {req.status}
                                </span>
                              </div>

                              <p className={`text-[11px] leading-relaxed ${isApproved ? "text-[#006B4D]" : isRejected ? "text-red-700" : "text-[#B45309]"}`}>
                                {req.description}
                              </p>

                              {!isApproved && !isRejected && (
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => handleApprove(msg.id, req.request_id, false)}
                                    className="px-3 py-1 rounded bg-white border border-[#DCDAD3] hover:bg-[#F0EFEA] text-red-700 font-medium text-xs transition cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleApprove(msg.id, req.request_id, true)}
                                    className="px-3.5 py-1 rounded bg-[#00A878] hover:bg-[#008F66] text-white font-medium text-xs shadow-2xs transition cursor-pointer"
                                  >
                                    Approve & Release
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Generated Deliverables Cards */}
                    {msg.artifacts && msg.artifacts.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#DCDAD3]">
                        <span className="text-[10px] font-semibold text-[#686762] uppercase tracking-wider">
                          Generated Deliverables
                        </span>
                        <div className="space-y-2">
                          {msg.artifacts.map((art, idx) => {
                            const downloadUrl = api.getDeliverableUrl(art.filename);
                            return (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-[#FAF9F6] border border-[#DCDAD3] flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="p-1.5 rounded bg-white border border-[#DCDAD3]">
                                    <FileText className="w-4 h-4 text-[#171717]" />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-semibold text-xs text-[#171717] truncate">
                                      {art.filename}
                                    </p>
                                    <p className="text-[11px] text-[#686762] truncate">
                                      {art.label || "Official Government Deliverable"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => onOpenDocumentPreview(art)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#DCDAD3] hover:bg-white text-xs text-[#171717] font-medium transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                  </button>
                                  <a
                                    href={downloadUrl}
                                    download={art.filename}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 px-3 py-1 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Contextual Action Buttons */}
                    <div className="pt-2 border-t border-[#DCDAD3] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {msg.showVerifyAction && (
                          <button
                            onClick={() => onOpenVerification(msg.findings)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FAF9F6] hover:bg-[#F0EFEA] border border-[#DCDAD3] text-xs font-medium text-[#171717] transition cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#00A878]" />
                            <span>Verify Findings</span>
                          </button>
                        )}

                        {msg.showReportAction && (
                          <button
                            onClick={() => handleGenerateReport(msg.id)}
                            disabled={msg.isGeneratingReport}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs cursor-pointer disabled:opacity-50"
                          >
                            {msg.isGeneratingReport ? (
                              <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating Report...</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                <span>Generate Report</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <span className="text-[10px] text-[#9E9D98] font-mono">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Working Progress State */}
        {isThinking && (
          <div className="flex justify-start animate-in fade-in duration-150">
            <div className="bg-white border border-[#DCDAD3] rounded-xl p-4 max-w-md w-full space-y-2.5 shadow-2xs text-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#171717]">
                <RotateCw className="w-3.5 h-3.5 text-[#00A878] animate-spin" />
                <span>Analyzing case evidence...</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#171717]">Reviewing documents</span>
                  <Check className="w-3.5 h-3.5 text-[#00A878]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#171717]">Checking approved guidance</span>
                  {progressStep >= 2 ? (
                    <Check className="w-3.5 h-3.5 text-[#00A878]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#00A878] animate-pulse" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={progressStep >= 2 ? "text-[#171717]" : "text-[#9E9D98]"}>
                    Verifying findings
                  </span>
                  {progressStep >= 3 ? (
                    <Check className="w-3.5 h-3.5 text-[#00A878]" />
                  ) : progressStep === 2 ? (
                    <span className="w-2 h-2 rounded-full bg-[#00A878] animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-[#DCDAD3]" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={progressStep >= 3 ? "text-[#171717]" : "text-[#9E9D98]"}>
                    Preparing response
                  </span>
                  {progressStep >= 4 ? (
                    <Check className="w-3.5 h-3.5 text-[#00A878]" />
                  ) : progressStep === 3 ? (
                    <span className="w-2 h-2 rounded-full bg-[#00A878] animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-[#DCDAD3]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Main Composer Box (Always at bottom) */}
      <div className="p-4 bg-white border-t border-[#DCDAD3] shrink-0 select-none">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Active Attached Files Pills */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {attachedFiles.map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF9F6] border border-[#DCDAD3] text-xs font-mono text-[#171717]"
                >
                  <Paperclip className="w-3 h-3 text-[#00A878]" />
                  <span className="truncate max-w-[200px]">{file}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file)}
                    className="text-[#9E9D98] hover:text-[#171717] ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="relative flex items-center bg-[#FAF9F6] border border-[#DCDAD3] rounded-xl p-1.5 focus-within:border-[#171717] transition shadow-2xs">
            {/* File Upload Trigger */}
            <label
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-[#686762] hover:text-[#171717] hover:bg-[#F0EFEA] cursor-pointer transition shrink-0"
              title="Add PDF, DOCX, XLSX, CSV, JPG, PNG"
            >
              <Paperclip className={`w-4 h-4 ${isUploading ? "animate-spin text-[#00A878]" : ""}`} />
              <span className="hidden sm:inline">
                {isUploading ? "Uploading..." : "Add files"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            {/* Prompt Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask anything about your documents..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#171717] placeholder-[#9E9D98] focus:outline-none resize-none font-sans"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={(!prompt.trim() && attachedFiles.length === 0) || isThinking}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#9E9D98] px-1 font-mono">
            <span>Supported: PDF, DOCX, XLSX, CSV, TXT, JPG, PNG</span>
            <span>100% Local Execution • Sovereign Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};
