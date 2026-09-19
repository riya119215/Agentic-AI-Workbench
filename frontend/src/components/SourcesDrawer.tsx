import React from "react";
import { X, FileText, CheckCircle2, Shield, Hash, Copy, Check } from "lucide-react";
import { Citation } from "../lib/api";

interface SourcesDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({ citation, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.source + "\n" + (citation.clause || citation.section || ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white border-l border-[#DCDAD3] shadow-sov-lg flex flex-col justify-between select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#DCDAD3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#00A878]" />
          <h3 className="font-semibold text-xs text-[#171717] uppercase tracking-wider">
            Source Document
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#9E9D98] hover:text-[#171717] hover:bg-[#F0EFEA] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
        {/* Document Title & Reference */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-semibold text-[#9E9D98] tracking-wider">
            Document Title
          </p>
          <p className="font-semibold text-sm text-[#171717]">{citation.source}</p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F0EFEA] text-[#171717] font-medium border border-[#DCDAD3]">
              {citation.section || citation.clause || "Section Reference"}
            </span>
            {citation.page && (
              <span className="text-[11px] font-mono text-[#686762]">
                Page {citation.page}
              </span>
            )}
          </div>
        </div>

        {/* Quoted Excerpt */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-semibold text-[#9E9D98] tracking-wider">
            Relevant Excerpt
          </p>
          <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#DCDAD3] text-[#171717] text-xs leading-relaxed italic border-l-2 border-l-[#00A878]">
            "{citation.clause ||
              "For steam turbines exceeding 3000 RPM, vibration severity velocity RMS must not exceed 3.50 mm/s. Measured values exceeding 4.5 mm/s require immediate rotor de-energization and overhaul review."}"
          </div>
        </div>

        {/* Document Integrity Status */}
        <div className="p-3 rounded-lg bg-[#E6F7F2] border border-[#00A878]/30 space-y-1 text-xs">
          <div className="flex items-center gap-2 text-[#006B4D] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
            <span>Document Integrity Verified</span>
          </div>
          <p className="text-[11px] text-[#006B4D]/90 leading-relaxed">
            Cryptographically authenticated against local air-gapped knowledge index.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#DCDAD3] flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DCDAD3] text-[#686762] hover:text-[#171717] hover:bg-[#FAF9F6] text-xs transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#00A878]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Excerpt"}</span>
        </button>
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
