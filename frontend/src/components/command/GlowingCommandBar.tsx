import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  X,
  FileText,
  FileCode,
  Image as ImageIcon,
  RotateCw,
  Mic,
  MicOff,
  ArrowRight,
  Check,
  ShieldCheck,
  Lock
} from "lucide-react";
import { api } from "../../lib/api";

interface GlowingCommandBarProps {
  onSend: (prompt: string, attachments: string[], mode?: string) => void;
  disabled?: boolean;
  initialPrompt?: string;
  initialAttachments?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export const GlowingCommandBar: React.FC<GlowingCommandBarProps> = ({
  onSend,
  disabled = false,
  initialPrompt = "",
  initialAttachments = [],
  placeholder = "Enter operational command directive or query document metrology...",
  autoFocus = false,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [attachments, setAttachments] = useState<string[]>(initialAttachments);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialAttachments.length > 0) setAttachments(initialAttachments);
  }, [initialPrompt, initialAttachments]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const newNames = fileList.map((f) => f.name);
    setAttachments((prev) => Array.from(new Set([...prev, ...newNames])));
    setIsUploading(true);

    try {
      for (const file of fileList) {
        await api.uploadEvidence(file, "default-workspace");
      }
      setUploadStatus(`Attached ${fileList.length} document${fileList.length > 1 ? "s" : ""}`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch {
      setUploadStatus(`Local attachment ready`);
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const fileList = Array.from(e.dataTransfer.files);
    const newNames = fileList.map((f) => f.name);
    setAttachments((prev) => Array.from(new Set([...prev, ...newNames])));
    setIsUploading(true);

    try {
      for (const file of fileList) {
        await api.uploadEvidence(file, "default-workspace");
      }
      setUploadStatus(`Attached ${fileList.length} document${fileList.length > 1 ? "s" : ""}`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch {
      setUploadStatus(`Local attachment ready`);
      setTimeout(() => setUploadStatus(null), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (filename: string) => {
    setAttachments((prev) => prev.filter((f) => f !== filename));
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed && attachments.length === 0) return;
    if (disabled || isUploading) return;

    onSend(trimmed, attachments, "Balanced");
    setPrompt("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["png", "jpg", "jpeg", "webp", "bmp"].includes(ext || "")) {
      return <ImageIcon className="w-3.5 h-3.5 text-[#D97706]" />;
    }
    if (["py", "json", "sql", "sh"].includes(ext || "")) {
      return <FileCode className="w-3.5 h-3.5 text-[#1E3E62]" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#0B192C]" />;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`w-full bg-white border-2 rounded-xl shadow-card transition-all font-sans overflow-hidden ${
        isDraggingOver
          ? "border-[#D97706] bg-[#FEF3C7]/20"
          : "border-[#CBD5E1] focus-within:border-[#1E3E62] focus-within:ring-2 focus-within:ring-[#1E3E62]/10"
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls,.pptx,.png,.jpg,.jpeg,.bmp,.webp,.py,.log,.json,.md"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Bar: Government Attachment Controls */}
      <div className="px-3.5 pt-2.5 pb-1 flex flex-wrap items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || disabled}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#1E3E62] hover:bg-[#E2E8F0] transition cursor-pointer disabled:opacity-50 border border-[#CBD5E1]"
          title="Attach official documents, SOPs, or images"
        >
          {isUploading ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin text-[#D97706]" />
          ) : (
            <Paperclip className="w-3.5 h-3.5 text-[#D97706]" />
          )}
          <span>Attach Evidence Files</span>
        </button>

        {uploadStatus && (
          <span className="text-[11px] text-[#059669] font-bold inline-flex items-center gap-1 bg-[#D1FAE5] px-2 py-0.5 rounded border border-[#059669]/30">
            <Check className="w-3 h-3" />
            {uploadStatus}
          </span>
        )}

        {attachments.map((file) => (
          <span
            key={file}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EBF0F5] border border-[#CBD5E1] text-xs font-medium text-[#0B192C]"
          >
            {getFileIcon(file)}
            <span className="truncate max-w-[180px]">{file}</span>
            <button
              type="button"
              onClick={() => removeAttachment(file)}
              className="text-[#64748B] hover:text-[#DC2626] cursor-pointer transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Textarea */}
      <div className="px-3.5 py-3">
        <textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          value={prompt}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          rows={2}
          placeholder={
            isListening
              ? "Listening to voice directive..."
              : placeholder
          }
          disabled={disabled}
          className="w-full bg-transparent border-0 p-0 text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed font-medium"
        />
      </div>

      {/* Bottom Control Row */}
      <div className="px-3.5 pb-2.5 pt-1 flex items-center justify-between border-t border-[#F1F5F9] bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-1.5 rounded-md transition cursor-pointer flex items-center gap-1 text-xs font-semibold ${
              isListening
                ? "bg-[#DC2626]/10 text-[#DC2626]"
                : "text-[#64748B] hover:text-[#0B192C] hover:bg-[#E2E8F0]"
            }`}
            title={isListening ? "Stop voice input" : "Dictate voice directive"}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{isListening ? "Listening..." : "Dictate"}</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#64748B] font-medium border-l border-[#CBD5E1] pl-3">
            <Lock className="w-3 h-3 text-[#059669]" />
            <span>Encrypted Local Pipeline</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!prompt.trim() && attachments.length === 0) || disabled || isUploading}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#0B192C] to-[#1E3E62] hover:from-[#07111E] hover:to-[#0B192C] text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-card border border-[#D97706]/40"
          title="Execute Command (Enter)"
        >
          <span>Execute Directive</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]" />
        </button>
      </div>
    </div>
  );
};
