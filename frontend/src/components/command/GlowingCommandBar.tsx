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
  Check
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
  placeholder = "Ask anything about your documents...",
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

  // Clean up speech recognition on unmount
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
    } catch (err: any) {
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
      return <ImageIcon className="w-3.5 h-3.5 text-[#00A878]" />;
    }
    if (["py", "json", "sql", "sh"].includes(ext || "")) {
      return <FileCode className="w-3.5 h-3.5 text-[#686762]" />;
    }
    return <FileText className="w-3.5 h-3.5 text-[#00A878]" />;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // Auto-adjust height
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
      className={`w-full bg-white border rounded-xl shadow-card transition-colors font-sans ${
        isDraggingOver
          ? "border-[#00A878] bg-[#E8F7F1]/30"
          : "border-[#DCDAD3] focus-within:border-[#00A878]"
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

      {/* Top Bar: Add Files Button + Active Attachment Chips */}
      <div className="px-3.5 pt-3 pb-1 flex flex-wrap items-center gap-2 border-b border-[#DCDAD3]/50">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || disabled}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#686762] hover:text-[#171717] hover:bg-[#F0EFEA] transition cursor-pointer disabled:opacity-50"
          title="Attach documents, reports, or images"
        >
          {isUploading ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin text-[#00A878]" />
          ) : (
            <Paperclip className="w-3.5 h-3.5" />
          )}
          <span>Add files</span>
        </button>

        {uploadStatus && (
          <span className="text-[11px] text-[#008F68] font-medium inline-flex items-center gap-1">
            <Check className="w-3 h-3" />
            {uploadStatus}
          </span>
        )}

        {attachments.map((file) => (
          <span
            key={file}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F0EFEA] border border-[#DCDAD3] text-xs text-[#171717]"
          >
            {getFileIcon(file)}
            <span className="truncate max-w-[180px]">{file}</span>
            <button
              type="button"
              onClick={() => removeAttachment(file)}
              className="text-[#8A8881] hover:text-[#C83A3A] cursor-pointer transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Middle: Textarea */}
      <div className="px-3.5 py-2">
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
              ? "Listening... speak into your microphone..."
              : placeholder
          }
          disabled={disabled}
          className="w-full bg-transparent border-0 p-0 text-sm text-[#171717] placeholder-[#8A8881] focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed"
        />
      </div>

      {/* Bottom Row: Voice Toggle & Send Button */}
      <div className="px-3.5 pb-3 pt-1 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#8A8881]">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              isListening
                ? "bg-[#C83A3A]/10 text-[#C83A3A]"
                : "text-[#8A8881] hover:text-[#171717] hover:bg-[#F0EFEA]"
            }`}
            title={isListening ? "Stop voice input" : "Dictate with microphone"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          {isListening && <span className="text-[11px] text-[#C83A3A]">Listening...</span>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!prompt.trim() && attachments.length === 0) || disabled || isUploading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00A878] hover:bg-[#008F68] text-white text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          title="Send (Enter)"
        >
          <span>Send</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
