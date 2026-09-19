import React from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Code,
  Download,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Artifact, api } from "../../lib/api";

interface DeliverableCardProps {
  artifact: Artifact;
  onPreview?: (artifact: Artifact) => void;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({ artifact, onPreview }) => {
  const downloadUrl = api.getDeliverableUrl(artifact.filename);

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "XLSX":
      case "CSV":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case "PPTX":
        return <Presentation className="w-4 h-4 text-amber-500" />;
      case "CODE":
      case "PY":
        return <Code className="w-4 h-4 text-accent-azure" />;
      default:
        return <FileText className="w-4 h-4 text-accent-azure" />;
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-surface border border-subtle hover:border-border-strong transition-all shadow-2xs flex items-center justify-between gap-3 font-sans select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-surface-elevated border border-subtle shrink-0">
          {getFileIcon(artifact.type)}
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-xs text-text-primary truncate">
              {artifact.filename}
            </h4>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-text-muted border border-subtle">
              {artifact.type}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary truncate mt-0.5">
            {artifact.label || "Approved Government Note Sheet & Deliverable"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onPreview && (
          <button
            onClick={() => onPreview(artifact)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-subtle hover:bg-surface-hover text-text-primary text-xs font-medium transition cursor-pointer"
            title="Preview formatted document"
          >
            <Eye className="w-3.5 h-3.5 text-text-muted" />
            <span>Preview</span>
          </button>
        )}

        <a
          href={downloadUrl}
          download={artifact.filename}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text-primary hover:bg-black text-white text-xs font-medium shadow-2xs transition cursor-pointer"
          title="Download local deliverable"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </a>
      </div>
    </div>
  );
};
