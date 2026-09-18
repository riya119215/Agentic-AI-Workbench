import React, { useState, useEffect } from "react";
import {
  Bot,
  Play,
  RotateCw,
  Send,
  FileText,
  CheckCircle2,
  Bookmark,
  Download,
  X,
  Clock
} from "lucide-react";
import { api, AgentResponse, UserProfile, ApprovalItem } from "../lib/api";
import { ApprovalModal } from "./ApprovalModal";

interface AgentStudioProps {
  currentUser: UserProfile | null;
  initialPrompt?: string;
  initialAttachments?: string[];
  onClearInitialDemo?: () => void;
}

export const AgentStudio: React.FC<AgentStudioProps> = ({
  currentUser,
  initialPrompt = "",
  initialAttachments = [],
  onClearInitialDemo,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>(initialAttachments);
  const [isRunning, setIsRunning] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [pendingApproval, setPendingApproval] = useState<ApprovalItem | null>(null);
  const [activeTabRight, setActiveTabRight] = useState<"citations" | "artifacts">("citations");
  const [selectedModel, setSelectedModel] = useState("Auto-Router (Local)");

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialAttachments.length > 0) {
        setSelectedAttachments(initialAttachments);
      }
      handleExecute(initialPrompt, initialAttachments);
      if (onClearInitialDemo) onClearInitialDemo();
    }
  }, [initialPrompt]);

  const handleExecute = async (promptToSend?: string, attachmentsOverride?: string[]) => {
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

      if (resp.approvals && resp.approvals.length > 0) {
        setPendingApproval(resp.approvals[0]);
      }
    } catch (err: any) {
      console.error(err);
      setAgentResponse({
        response: `Execution error: ${err.message}`,
        steps: [
          { step_num: 1, title: "Initialize sovereign pipeline", model_used: "Router", status: "COMPLETED", details: "Parameters loaded" },
          { step_num: 2, title: "Model inference", model_used: "Local Engine", status: "ERROR", details: err.message }
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

  const addAttachment = (filename: string) => {
    if (!selectedAttachments.includes(filename)) {
      setSelectedAttachments([...selectedAttachments, filename]);
    }
  };

  const removeAttachment = (filename: string) => {
    setSelectedAttachments(selectedAttachments.filter(f => f !== filename));
  };

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-5 flex flex-col h-[calc(100vh-3.5rem)] space-y-4">
      {/* Approval Modal */}
      {pendingApproval && (
        <ApprovalModal
          request={pendingApproval}
          onApprove={async (id) => {
            await api.respondApproval(id, true);
            setPendingApproval(null);
          }}
          onReject={async (id) => {
            await api.respondApproval(id, false);
            setPendingApproval(null);
          }}
          onClose={() => setPendingApproval(null)}
        />
      )}

      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-sovBorder shrink-0">
        <div>
          <h1 className="text-base font-semibold text-sovGraphite-950">
            Agent Studio
          </h1>
          <p className="text-xs text-sovGraphite-500 mt-0.5">
            Autonomous multi-step execution and evidence synthesis
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sovWarm-100 text-sovGraphite-700 text-xs">
            <span className="text-sovGraphite-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent font-medium text-sovGraphite-900 focus:outline-none cursor-pointer"
            >
              <option value="Auto-Router (Local)">Auto-Router</option>
              <option value="qwen2.5:7b-instruct">Qwen 2.5 7B (Reasoning)</option>
              <option value="glm-4:9b">GLM-4 9B (Document)</option>
              <option value="llava:7b">LLaVA 7B (Vision)</option>
            </select>
          </div>

          <button
            onClick={() => handleExecute()}
            disabled={!prompt.trim() || isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs transition ${
              !prompt.trim() || isRunning
                ? "bg-sovWarm-200 text-sovGraphite-400 cursor-not-allowed"
                : "bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white"
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run agent</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Tri-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* LEFT: Evidence (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-4 pr-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-semibold text-sovGraphite-900">
                Evidence
              </span>
              <span className="text-[11px] text-sovGraphite-400">
                {selectedAttachments.length} selected
              </span>
            </div>

            {/* Evidence Sample Buttons */}
            <div className="space-y-1">
              <div
                onClick={() => addAttachment("INSPECTION_REPORT_TURBINE_UNIT_7.txt")}
                className={`p-2.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                  selectedAttachments.includes("INSPECTION_REPORT_TURBINE_UNIT_7.txt")
                    ? "bg-white border border-sovBorder shadow-2xs text-sovGraphite-950"
                    : "hover:bg-sovWarm-100 text-sovGraphite-600 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-sovBlue-600 shrink-0" />
                  <span className="text-xs font-medium truncate">Turbine Inspection (PDF)</span>
                </div>
                {selectedAttachments.includes("INSPECTION_REPORT_TURBINE_UNIT_7.txt") && (
                  <span className="text-[10px] text-emerald-700 font-medium shrink-0">Attached</span>
                )}
              </div>

              <div
                onClick={() => addAttachment("railway_sensor_telemetry.csv")}
                className={`p-2.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                  selectedAttachments.includes("railway_sensor_telemetry.csv")
                    ? "bg-white border border-sovBorder shadow-2xs text-sovGraphite-950"
                    : "hover:bg-sovWarm-100 text-sovGraphite-600 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium truncate">Railway Telemetry (CSV)</span>
                </div>
                {selectedAttachments.includes("railway_sensor_telemetry.csv") && (
                  <span className="text-[10px] text-emerald-700 font-medium shrink-0">Attached</span>
                )}
              </div>

              <div
                onClick={() => addAttachment("bearing_cavitation_scan.png")}
                className={`p-2.5 rounded-lg transition cursor-pointer flex items-center justify-between ${
                  selectedAttachments.includes("bearing_cavitation_scan.png")
                    ? "bg-white border border-sovBorder shadow-2xs text-sovGraphite-950"
                    : "hover:bg-sovWarm-100 text-sovGraphite-600 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs font-medium truncate">Cavitation Scan (PNG)</span>
                </div>
                {selectedAttachments.includes("bearing_cavitation_scan.png") && (
                  <span className="text-[10px] text-emerald-700 font-medium shrink-0">Attached</span>
                )}
              </div>
            </div>

            {/* Selected Attachment Chips */}
            {selectedAttachments.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedAttachments.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-sovBorder text-sovGraphite-700 text-[11px]"
                  >
                    <span className="truncate max-w-[120px]">{f}</span>
                    <button onClick={() => removeAttachment(f)} className="text-sovGraphite-400 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 text-[11px] text-sovGraphite-400 flex items-center justify-between border-t border-sovBorder-subtle">
            <span>Security: On-premise</span>
            <span className="text-emerald-700 font-medium">Air-gapped</span>
          </div>
        </div>

        {/* CENTER: Canvas & Step Timeline (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-sovBorder rounded-xl p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle">
              <span className="text-xs font-semibold text-sovGraphite-900">
                Agent run
              </span>
              <span className="text-[11px] text-sovGraphite-400">
                {isRunning ? "Running..." : agentResponse ? "Completed" : "Ready"}
              </span>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-2">
              {agentResponse?.steps && agentResponse.steps.length > 0 ? (
                agentResponse.steps.map((st) => (
                  <div
                    key={st.step_num}
                    className="p-3 rounded-lg bg-sovWarm-50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {st.status === "COMPLETED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : st.status === "ERROR" ? (
                          <X className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-sovGraphite-400 shrink-0" />
                        )}
                        <span className="font-medium text-sovGraphite-900">
                          {st.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-sovGraphite-500">
                        {st.model_used}
                      </span>
                    </div>
                    <p className="text-[11px] text-sovGraphite-600 leading-relaxed pl-5.5">
                      {st.details}
                    </p>
                  </div>
                ))
              ) : isRunning ? (
                <div className="p-4 rounded-lg bg-sovWarm-50 flex items-center gap-3 text-xs text-sovGraphite-700">
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Evaluating task · Searching local knowledge · Reasoning...</span>
                </div>
              ) : (
                <div className="py-12 text-center text-sovGraphite-400 text-xs">
                  Enter a mission directive below to run the sovereign agent.
                </div>
              )}
            </div>

            {/* Output Summary */}
            {agentResponse && (
              <div className="p-3.5 rounded-lg bg-sovWarm-50 space-y-1 text-xs">
                <div className="text-[11px] font-semibold text-sovGraphite-700">
                  Summary note
                </div>
                <p className="text-sovGraphite-800 leading-relaxed whitespace-pre-wrap">
                  {agentResponse.response}
                </p>
              </div>
            )}
          </div>

          {/* Prompt Composer Box */}
          <div className="pt-2 border-t border-sovBorder space-y-2">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="Instruct the sovereign agent..."
                className="w-full text-xs bg-sovWarm-50 border border-sovBorder rounded-lg p-3 pr-10 text-sovGraphite-900 placeholder-sovGraphite-400 focus:outline-none focus:border-sovGraphite-400 resize-none font-sans"
              />
              <button
                type="button"
                onClick={() => handleExecute()}
                disabled={!prompt.trim() || isRunning}
                className="absolute right-2.5 bottom-3.5 p-1.5 rounded-md bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white disabled:opacity-30 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Citations & Artifacts (3 cols) */}
        <div className="lg:col-span-3 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-4 pl-1">
          <div className="space-y-3">
            {/* Clean Tabs */}
            <div className="flex items-center gap-1 bg-sovWarm-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setActiveTabRight("citations")}
                className={`flex-1 py-1 rounded-md text-center font-medium transition ${
                  activeTabRight === "citations"
                    ? "bg-white text-sovGraphite-950 shadow-2xs"
                    : "text-sovGraphite-500 hover:text-sovGraphite-900"
                }`}
              >
                Citations ({agentResponse?.citations?.length || 0})
              </button>
              <button
                onClick={() => setActiveTabRight("artifacts")}
                className={`flex-1 py-1 rounded-md text-center font-medium transition ${
                  activeTabRight === "artifacts"
                    ? "bg-white text-sovGraphite-950 shadow-2xs"
                    : "text-sovGraphite-500 hover:text-sovGraphite-900"
                }`}
              >
                Artifacts ({agentResponse?.artifacts?.length || 0})
              </button>
            </div>

            {/* TAB: CITATIONS */}
            {activeTabRight === "citations" && (
              <div className="space-y-2">
                {!agentResponse?.citations || agentResponse.citations.length === 0 ? (
                  <div className="py-8 text-center text-sovGraphite-400 text-xs">
                    No citations in current view.
                  </div>
                ) : (
                  agentResponse.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white border border-sovBorder space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-sovGraphite-900 text-xs">
                        <span className="truncate">{c.source}</span>
                        {c.page && <span className="text-[11px] text-sovGraphite-400 shrink-0 font-normal">Pg {c.page}</span>}
                      </div>
                      <p className="text-[11px] text-sovGraphite-600 italic">
                        "{c.clause || c.section || "Clause reference"}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: ARTIFACTS */}
            {activeTabRight === "artifacts" && (
              <div className="space-y-2">
                {!agentResponse?.artifacts || agentResponse.artifacts.length === 0 ? (
                  <div className="py-8 text-center text-sovGraphite-400 text-xs">
                    No deliverables generated yet.
                  </div>
                ) : (
                  agentResponse.artifacts.map((art, idx) => {
                    const downloadUrl = api.getDeliverableUrl(art.filename);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-white border border-sovBorder space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sovGraphite-900 text-xs truncate">
                            {art.filename}
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-sovWarm-100 text-sovGraphite-500">
                            {art.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-sovGraphite-500">{art.label}</div>
                        <div className="pt-1 flex items-center justify-end">
                          <a
                            href={downloadUrl}
                            download={art.filename}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white text-xs font-medium transition"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-sovBorder-subtle text-[11px] text-sovGraphite-400">
            Audit logging registered
          </div>
        </div>
      </div>
    </div>
  );
};
