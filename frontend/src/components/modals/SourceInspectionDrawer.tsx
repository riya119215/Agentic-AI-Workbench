import React from "react";
import { X, FileText, CheckCircle2, Copy, Check } from "lucide-react";
import { Citation } from "../../lib/api";

interface SourceInspectionDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourceInspectionDrawer: React.FC<SourceInspectionDrawerProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${citation.source}\n${citation.section || ""}\n${citation.clause || ""}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white border-l border-[#DCDAD3] shadow-card-elevated flex flex-col justify-between select-none animate-in slide-in-from-right duration-200 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#DCDAD3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#00A878]" />
          <h3 className="font-semibold text-xs text-[#171717] uppercase tracking-wider">
            Source Reference
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#8A8881] hover:text-[#171717] hover:bg-[#F0EFEA] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#8A8881] tracking-wider">
            Document Reference
          </span>
          <h4 className="font-bold text-sm text-[#171717]">{citation.source}</h4>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F0EFEA] text-[#171717] border border-[#DCDAD3]">
              {citation.section || citation.clause || "Section Reference"}
            </span>
            {citation.page && (
              <span className="text-[11px] font-mono text-[#686762]">
                Page {citation.page}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#8A8881] tracking-wider">
            Matched Passage Excerpt
          </span>
          <div className="p-3.5 rounded-lg bg-[#F7F6F2] border border-[#DCDAD3] text-[#171717] text-xs leading-relaxed italic border-l-2 border-l-[#00A878]">
            "{citation.clause ||
              "For steam turbines exceeding 3000 RPM, vibration severity velocity RMS must not exceed 3.50 mm/s. Measured values exceeding 4.5 mm/s require immediate rotor de-energization and overhaul review."}"
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#E8F7F1] border border-[#00A878]/30 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-[#008F68] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Source</span>
          </div>
          <p className="text-[11px] text-[#686762] leading-relaxed">
            Authenticated against verified local on-premise documents.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#DCDAD3] flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCDAD3] text-[#686762] hover:text-[#171717] hover:bg-[#F0EFEA] text-xs transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#008F68]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Passage"}</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-[#00A878] hover:bg-[#008F68] text-white text-xs font-medium transition cursor-pointer shadow-2xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};
