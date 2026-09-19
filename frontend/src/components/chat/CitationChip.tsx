import React, { useState } from "react";
import { FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { Citation } from "../../lib/api";

interface CitationChipProps {
  index: number;
  citation: Citation;
  onClick?: (citation: Citation) => void;
}

export const CitationChip: React.FC<CitationChipProps> = ({ index, citation, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="inline-block relative font-sans mx-0.5 align-super select-none">
      <button
        onClick={() => onClick && onClick(citation)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/30 transition-all cursor-pointer"
      >
        [{index}]
      </button>

      {/* Hover Preview Card */}
      {isHovered && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-surface border border-subtle rounded-xl shadow-card-elevated z-50 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-subtle mb-1.5">
            <FileText className="w-3.5 h-3.5 text-accent-azure" />
            <span className="font-semibold text-xs text-text-primary truncate">
              {citation.source}
            </span>
          </div>

          <div className="text-[11px] text-text-secondary line-clamp-3 italic">
            "{citation.clause || citation.section || "Matched regulatory clause reference"}"
          </div>

          <div className="mt-2 pt-1.5 border-t border-subtle flex items-center justify-between text-[10px] font-mono text-accent-emerald">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Source</span>
            </span>
            {citation.page && <span>Page {citation.page}</span>}
          </div>
        </div>
      )}
    </span>
  );
};
