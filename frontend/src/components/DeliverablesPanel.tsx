import React from "react";
import { FileText, FileSpreadsheet, Presentation, Image as ImageIcon, Download, CheckCircle2, Shield } from "lucide-react";
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
      case "PPTX":
        return <Presentation className="w-5 h-5 text-amber-400" />;
      case "PNG":
      case "JPG":
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 my-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-2">
          <span>📦 Generated Deliverables & Real File Artifacts</span>
        </h4>
        <span className="text-[10px] text-emerald-400 font-mono font-bold">
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
              className="flex flex-col justify-between p-3 rounded-lg bg-[#060D1A] border border-slate-800/80 hover:border-cyan-500/40 transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {getIcon(art.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-100 font-mono truncate" title={art.filename}>
                    {art.filename}
                  </p>
                  <p className="text-[11px] text-slate-300">{art.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {art.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(art.size_bytes / 1024).toFixed(1)} KB
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> SHA-256 Verified
                    </span>
                  </div>
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
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-sm transition-all"
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
