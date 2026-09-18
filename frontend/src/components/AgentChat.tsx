import React, { useState } from "react";
import { Send, Sparkles, Paperclip, FileText, Cpu, CheckCircle2, Shield, Bot, User, Bookmark, X, AlertTriangle } from "lucide-react";
import { api, AgentResponse, UserProfile, ApprovalItem } from "../lib/api";
import { ExecutionGraph } from "./ExecutionGraph";
import { DeliverablesPanel } from "./DeliverablesPanel";
import { ApprovalModal } from "./ApprovalModal";

interface AgentChatProps {
  currentUser: UserProfile | null;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  responsePayload?: AgentResponse;
}

export const AgentChat: React.FC<AgentChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [pendingApproval, setPendingApproval] = useState<ApprovalItem | null>(null);

  const handleSend = async (promptToSend?: string, attachmentsOverride?: string[]) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim()) return;

    const attachments = attachmentsOverride || selectedAttachments;
    const userMsgId = `msg_${Date.now()}`;

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ];

    setMessages(newMessages);
    setInputPrompt("");
    setSelectedAttachments([]);
    setLoading(true);

    try {
      const response = await api.executeAgent(
        text,
        currentUser?.user_id || "officer_sharma",
        attachments,
        currentUser?.clearance_level || "RESTRICTED"
      );

      // Check if approvals requested
      if (response.approvals && response.approvals.length > 0) {
        setPendingApproval(response.approvals[0]);
      }

      setMessages([
        ...newMessages,
        {
          id: `msg_agent_${Date.now()}`,
          sender: "agent",
          text: response.response,
          timestamp: new Date().toLocaleTimeString(),
          responsePayload: response,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          id: `msg_err_${Date.now()}`,
          sender: "agent",
          text: `⚠️ Task Execution Error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
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

      {/* Flagship Demo Starter Banner */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-3.5 mb-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              SIH26117 Flagship Demonstration Workflows (1-Click Run)
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">AIR-GAPPED AGENTS</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => handleSend("Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.", ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"])}
            className="text-left p-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-xs text-blue-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-bold text-blue-300">🔥 Demo 1: DOCX Note</span>
            <span className="text-[10px] text-slate-400 mt-1">OCR $\rightarrow$ SOP RAG $\rightarrow$ DOCX</span>
          </button>

          <button
            onClick={() => handleSend("Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.", ["railway_sensor_telemetry.csv"])}
            className="text-left p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-xs text-emerald-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-bold text-emerald-300">📊 Demo 2: Sandbox Analytics</span>
            <span className="text-[10px] text-slate-400 mt-1">CSV $\rightarrow$ Sandbox $\rightarrow$ XLSX+PNG</span>
          </button>

          <button
            onClick={() => handleSend("What are the mandatory vibration and temperature tolerance limits according to sovereign turbomachinery SOP? Cite exact clauses.", ["SOP_TURBINE_MAINTENANCE_V4.txt"])}
            className="text-left p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-xs text-purple-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-bold text-purple-300">📚 Demo 3: Cited RAG</span>
            <span className="text-[10px] text-slate-400 mt-1">ChromaDB $\rightarrow$ Exact Citations</span>
          </button>

          <button
            onClick={() => handleSend("Analyze scanned defect photograph for journal bearing cavitation and evaluate against defence standards.", ["bearing_cavitation_scan.png"])}
            className="text-left p-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-xs text-cyan-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-bold text-cyan-300">👁️ Demo 4: Vision & Scans</span>
            <span className="text-[10px] text-slate-400 mt-1">Vision Model $\rightarrow$ Pitting Analysis</span>
          </button>

          <button
            onClick={() => handleSend("Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx).", ["inspection.pdf", "railway_sensor_telemetry.csv", "photo.jpg"])}
            className="text-left p-2.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-xs text-amber-200 transition-all flex flex-col justify-between group col-span-2 md:col-span-1"
          >
            <span className="font-bold text-amber-300">⭐ Demo 5: Master Suite</span>
            <span className="text-[10px] text-slate-400 mt-1">DOCX + XLSX + PPTX + Plot</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0B1528] border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200 font-mono">
                SOVEREIGN COMMAND CONSOLE READY
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Enter an official mission prompt, attach classified evidence, or select one of the five SIH flagship demonstration scenarios above.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm shadow-md leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-cyan-600 text-slate-950 font-medium rounded-br-none"
                    : "bg-[#0B1528] border border-slate-800 text-slate-200 rounded-bl-none w-full"
                }`}
              >
                {/* Sender Header */}
                <div className="flex items-center space-x-2 mb-1.5 pb-1 border-b border-white/10 text-[11px] opacity-80 font-mono">
                  {msg.sender === "user" ? (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>{currentUser?.name || "Officer"} ({currentUser?.role})</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sovereign Agent (Air-Gapped On-Premise Engine)</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Text */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm mt-2 leading-relaxed">
                  {msg.text}
                </div>

                {/* Response Visualizers (if agent) */}
                {msg.responsePayload && (
                  <div className="mt-4 space-y-3">
                    {/* Execution Graph */}
                    <ExecutionGraph
                      steps={msg.responsePayload.steps}
                      modelRouting={msg.responsePayload.model_routing}
                    />

                    {/* Citations / Evidence */}
                    {msg.responsePayload.citations && msg.responsePayload.citations.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#060D1A] border border-slate-800/80">
                        <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5 mb-2 font-mono">
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Regulatory Citations & Document Evidence</span>
                        </h5>
                        <div className="space-y-1.5">
                          {msg.responsePayload.citations.map((c, cIdx) => (
                            <div key={cIdx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                              <span className="text-amber-400 font-mono font-bold">•</span>
                              <div>
                                <span className="font-bold text-slate-200">[{c.source} - Pg {c.page}]: </span>
                                <span className="text-slate-400">{c.clause || c.section}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real Deliverables Drawer */}
                    <DeliverablesPanel artifacts={msg.responsePayload.artifacts} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-[#0B1528] border border-slate-800 max-w-md">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-300 font-mono">
              Planning task $\rightarrow$ Routing model $\rightarrow$ Executing sovereign pipeline...
            </div>
          </div>
        )}
      </div>

      {/* Attachment Chips */}
      {selectedAttachments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 px-2 flex-wrap">
          {selectedAttachments.map((att) => (
            <span key={att} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 font-mono">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>{att}</span>
              <button onClick={() => removeAttachment(att)} className="text-slate-400 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-2.5 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          {/* Attachment Selector Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Attach Sample Dataset"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 bg-[#060D1A] border border-slate-800 rounded-xl p-2 shadow-2xl z-20 space-y-1">
              <p className="text-[10px] font-mono text-slate-400 font-bold px-2 py-1 uppercase">Sample Attachments</p>
              <button
                type="button"
                onClick={() => addAttachment("INSPECTION_REPORT_TURBINE_UNIT_7.txt")}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 font-mono flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-cyan-400" />
                <span>Turbine Inspection (.txt)</span>
              </button>
              <button
                type="button"
                onClick={() => addAttachment("railway_sensor_telemetry.csv")}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 font-mono flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-emerald-400" />
                <span>Railway Telemetry (.csv)</span>
              </button>
              <button
                type="button"
                onClick={() => addAttachment("bearing_cavitation_scan.png")}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 font-mono flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-purple-400" />
                <span>Bearing Scan (.png)</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Instruct Sovereign Agent (e.g., 'Analyze turbine inspection report and compile Approval Note')..."
            className="flex-1 bg-transparent border-0 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className={`p-2.5 rounded-xl text-slate-950 font-bold transition-all flex items-center justify-center ${
              !inputPrompt.trim() || loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-400 shadow-md shadow-cyan-950/50"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
