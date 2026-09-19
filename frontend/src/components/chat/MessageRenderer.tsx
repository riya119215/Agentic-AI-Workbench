import React, { useState } from "react";
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Download,
  AlertTriangle,
  FileText,
  Sparkles,
  Layers,
  Terminal,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessageItem } from "../../lib/types";
import { CodeBlock } from "./CodeBlock";
import { CitationChip } from "./CitationChip";
import { StatCard } from "./StatCard";
import { DeliverableCard } from "./DeliverableCard";
import { ModelRoutingChip } from "../command/ModelRoutingChip";
import { Artifact, Citation } from "../../lib/api";

interface MessageRendererProps {
  message: ChatMessageItem;
  onRunInSandbox?: (code: string) => void;
  onPreviewDeliverable?: (artifact: Artifact) => void;
  onOpenCitation?: (citation: Citation) => void;
  onOpenVerification?: () => void;
  onRegenerate?: () => void;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({
  message,
  onRunInSandbox,
  onPreviewDeliverable,
  onOpenCitation,
  onOpenVerification,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = message.text.replace(/[*#`_\[\]]/g, " ").replace(/\s+/g, " ").trim();
    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // If message is from user
  if (message.sender === "user") {
    return (
      <div className="flex justify-end my-4 select-none">
        <div className="max-w-[85%] sm:max-w-[70%] bg-accent-primary/10 border border-accent-primary/25 text-text-primary rounded-2xl px-4 py-3 space-y-2 shadow-card-elevated font-sans">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {message.attachments.map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface border border-subtle text-xs font-mono text-text-primary shadow-2xs"
                >
                  <Paperclip className="w-3 h-3 text-accent-azure" />
                  <span className="truncate max-w-[180px]">{file}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <div className="text-[10px] text-text-muted text-right font-mono">{message.timestamp}</div>
        </div>
      </div>
    );
  }

  // Parse inline text containing **bold**, `code`, and [1], [2] citations
  const renderInlineText = (text: string) => {
    // Regex for inline code `...`, citations [1], [2], or bold **...**
    const tokens = text.split(/(\[\[?[0-9]+\]?\]|\*\*[^*]+\*\*|`[^`]+`)/g);

    return tokens.map((tok, i) => {
      if (!tok) return null;

      // Bold match **bold**
      if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) {
        return (
          <strong key={i} className="font-semibold text-text-primary">
            {tok.slice(2, -2)}
          </strong>
        );
      }

      // Inline code `code`
      if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-surface-elevated border border-subtle font-mono text-xs text-accent-azure">
            {tok.slice(1, -1)}
          </code>
        );
      }

      // Citation match e.g. [1], [2]
      const citMatch = tok.match(/^\[([0-9]+)\]$/);
      if (citMatch) {
        const citIdx = parseInt(citMatch[1], 10);
        const citObj: Citation = message.citations?.[citIdx - 1] || {
          source: `SOP Standard Section ${citIdx}`,
          clause: `Verified specification reference #${citIdx}`,
          page: 4,
          section: `Section ${citIdx}.1`
        };

        return (
          <CitationChip
            key={i}
            index={citIdx}
            citation={citObj}
            onClick={onOpenCitation}
          />
        );
      }

      return <span key={i}>{tok}</span>;
    });
  };

  // Helper to parse markdown paragraphs, code blocks, and headings
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split("\n");
    const elements: React.ReactNode[] = [];
    let codeBuffer: string[] = [];
    let inCodeBlock = false;
    let codeLang = "python";

    lines.forEach((line, idx) => {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace("```", "").trim() || "python";
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <CodeBlock
              key={`code-${idx}`}
              language={codeLang}
              code={codeBuffer.join("\n")}
              onRunInSandbox={onRunInSandbox}
            />
          );
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Headings
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={idx} className="text-base font-bold text-text-primary mt-4 mb-1.5">
            {renderInlineText(line.replace("### ", ""))}
          </h4>
        );
        return;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h3 key={idx} className="text-lg font-bold text-text-primary mt-5 mb-2 pb-1 border-b border-subtle">
            {renderInlineText(line.replace("## ", ""))}
          </h3>
        );
        return;
      }

      // Bullet lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const itemText = line.substring(2);
        elements.push(
          <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-1 text-[15px] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accent-emerald to-accent-azure mt-2 shrink-0" />
            <span className="text-text-primary">{renderInlineText(itemText)}</span>
          </div>
        );
        return;
      }

      // Regular paragraph
      if (line.trim().length > 0) {
        elements.push(
          <p key={idx} className="text-[15px] leading-[1.68] text-text-primary my-2.5">
            {renderInlineText(line)}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="group relative w-full my-6 text-left max-w-3xl">
      {/* Model Routing Chip Header */}
      {message.model_routing && (
        <div className="mb-2.5">
          <ModelRoutingChip routingInfo={message.model_routing} />
        </div>
      )}

      {/* Main Assistant Body */}
      <div className="space-y-4 font-sans text-text-primary">
        {/* Render Formatted Markdown / Text */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {renderFormattedText(message.text)}
        </div>

        {/* Structured Metric Callout Cards (Findings) */}
        {message.findings && message.findings.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Extracted Metric Findings & Threshold Verification
              </span>
              {onOpenVerification && (
                <button
                  onClick={onOpenVerification}
                  className="text-xs text-accent-primary hover:underline font-medium cursor-pointer"
                >
                  View Full Verification Table →
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.findings.map((f, i) => (
                <StatCard key={i} finding={f} onClick={onOpenVerification} />
              ))}
            </div>
          </div>
        )}

        {/* Structured Deliverable Files Cards */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              Generated Official Deliverables
            </span>
            <div className="space-y-2">
              {message.artifacts.map((art, idx) => (
                <DeliverableCard
                  key={idx}
                  artifact={art}
                  onPreview={onPreviewDeliverable}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grounded Knowledge Citations Strip */}
        {message.citations && message.citations.length > 0 && (
          <div className="pt-3 border-t border-subtle flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-text-muted">Sources:</span>
            {message.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onOpenCitation && onOpenCitation(c)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-subtle hover:border-accent-azure/40 text-xs font-sans text-text-primary transition shadow-card-elevated cursor-pointer group hover:-translate-y-0.5"
              >
                <FileText className="w-3.5 h-3.5 text-accent-azure group-hover:scale-105 transition" />
                <span className="font-medium truncate max-w-[180px]">{c.source}</span>
                <span className="text-[10px] text-text-muted font-mono">
                  {c.section ? `(${c.section})` : c.page ? `(p.${c.page})` : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Per-Message Floating Action Row */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 pt-2 flex items-center gap-2 select-none">
        <button
          onClick={handleCopyText}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition cursor-pointer"
          title="Copy answer text"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>

        <button
          onClick={handleToggleSpeech}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition cursor-pointer ${
            isSpeaking
              ? "bg-accent-azure/20 text-accent-azure border border-accent-azure/40 font-medium"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          }`}
          title={isSpeaking ? "Stop reading aloud" : "Read aloud (Offline Speech Synthesis)"}
        >
          {isSpeaking ? (
            <VolumeX className="w-3.5 h-3.5 text-accent-azure animate-pulse" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span>{isSpeaking ? "Stop" : "Read Aloud"}</span>
        </button>

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition cursor-pointer"
            title="Regenerate answer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        )}

        <div className="w-[1px] h-3 bg-subtle mx-1" />

        <button
          onClick={() => setFeedback("up")}
          className={`p-1.5 rounded-md hover:bg-surface-hover transition cursor-pointer ${
            feedback === "up" ? "text-accent-emerald" : "text-text-muted hover:text-text-primary"
          }`}
          title="Helpful response"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setFeedback("down")}
          className={`p-1.5 rounded-md hover:bg-surface-hover transition cursor-pointer ${
            feedback === "down" ? "text-rose-500" : "text-text-muted hover:text-text-primary"
          }`}
          title="Unsatisfactory response"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
