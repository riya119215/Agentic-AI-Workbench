import React, { useState } from "react";
import { Send, Sparkles, Paperclip, FileText, Cpu, CheckCircle2, Shield, Bot, User, Bookmark } from "lucide-react";
import { api, AgentResponse, UserProfile } from "../lib/api";
import { ExecutionGraph } from "./ExecutionGraph";
import { DeliverablesPanel } from "./DeliverablesPanel";

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

  const handleSend = async (promptToSend?: string, attachmentsOverride?: string[]) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim()) return;

    const attachments = attachmentsOverride || selectedAttachments;
    const userMsgId = `msg_${Date.now()}`;

    // Add user message
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
        attachments
      );

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

  // Flagship Demo Quick Starters
  const runFlagshipDemo1 = () => {
    const prompt = "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.";
    handleSend(prompt, ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]);
  };

  const runFlagshipDemo2 = () => {
    const prompt = "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.";
    handleSend(prompt, ["railway_sensor_telemetry.csv"]);
  };

  const runFlagshipDemo3 = () => {
    const prompt = "What are the mandatory vibration and temperature tolerance limits according to sovereign turbomachinery SOP? Cite exact clauses.";
    handleSend(prompt, ["SOP_TURBINE_MAINTENANCE_V4.txt"]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Flagship Demo Starter Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-4 shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Flagship SIH 2026 Demonstration Workflows (1-Click Run)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={runFlagshipDemo1}
            className="text-left p-2.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-xs text-blue-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-semibold text-blue-300">🔥 Flagship 1: Inspection & Approval Note</span>
            <span className="text-[11px] text-slate-400 mt-1">
              Scanned Report OCR $\rightarrow$ RAG SOP $\rightarrow$ Formal .DOCX Note
            </span>
          </button>

          <button
            onClick={runFlagshipDemo2}
            className="text-left p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-xs text-emerald-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-semibold text-emerald-300">📊 Flagship 2: Sandbox Python Analytics</span>
            <span className="text-[11px] text-slate-400 mt-1">
              Telemetry CSV $\rightarrow$ Code Sandbox $\rightarrow$ Plot PNG + .XLSX
            </span>
          </button>

          <button
            onClick={runFlagshipDemo3}
            className="text-left p-2.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-xs text-purple-200 transition-all flex flex-col justify-between group"
          >
            <span className="font-semibold text-purple-300">📚 Flagship 3: Air-Gapped Sovereign RAG</span>
            <span className="text-[11px] text-slate-400 mt-1">
              ChromaDB Search $\rightarrow$ Exact Clause Citation $\rightarrow$ Zero-Egress
            </span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-300">
                Sovereign Agentic Command Console Ready
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Enter an official task, upload confidential documents, or click one of the flagship demo workflows above.
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
              {/* Message Bubble */}
              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm shadow-md leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-900/95 border border-slate-800 text-slate-200 rounded-bl-none w-full"
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
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                      <span>Sovereign Agent (Air-Gapped Local Inference)</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body Text */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm mt-2">
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
                      <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                        <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Regulatory Citations & Document Evidence</span>
                        </h5>
                        <div className="space-y-1.5">
                          {msg.responsePayload.citations.map((c, cIdx) => (
                            <div key={cIdx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                              <span className="text-amber-400 font-mono font-bold">•</span>
                              <div>
                                <span className="font-semibold text-slate-200">[{c.source} - Pg {c.page}]: </span>
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
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 max-w-md">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs text-slate-300 font-mono">
              Planning task $\rightarrow$ Routing model $\rightarrow$ Executing sovereign pipeline...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
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
            className={`p-2.5 rounded-xl text-white transition-all flex items-center justify-center ${
              !inputPrompt.trim() || loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
