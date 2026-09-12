import React from "react";
import { FileText, FileSpreadsheet, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { Artifact, api } from "../lib/api";

interface DeliverablesPanelProps {
  artifacts: Artifact[];
}

export const DeliverablesPanel: React.FC<DeliverablesPanelProps> = ({ artifacts }) => {
  if (!artifacts || artifacts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "DOCX":
        return <FileText className="w-5 h-5 text-blue-400" />;
      case "XLSX":
      case "CSV":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "PNG":
      case "JPG":
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 my-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <span>📦 Generated Deliverables & Real File Artifacts</span>
        </h4>
        <span className="text-[10px] text-emerald-400 font-mono">
          {artifacts.length} file(s) compiled on-premise
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {artifacts.map((art, idx) => {
          const downloadUrl = api.getDeliverableUrl(art.filename);
          const isImage = art.type.toUpperCase() === "PNG" || art.type.toUpperCase() === "JPG";

          return (
            <div
              key={idx}
              className="flex flex-col justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {getIcon(art.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate" title={art.filename}>
                    {art.filename}
                  </p>
                  <p className="text-[11px] text-slate-400">{art.label}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Format: {art.type} • {(art.size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {isImage && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-800/60 bg-black/40 max-h-40 flex items-center justify-center">
                  <img
                    src={downloadUrl}
                    alt={art.filename}
                    className="max-h-36 w-auto object-contain"
                  />
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end space-x-2">
                <a
                  href={downloadUrl}
                  download={art.filename}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/90 hover:bg-blue-600 text-white shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Deliverable</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
