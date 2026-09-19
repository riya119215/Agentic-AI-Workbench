import React from "react";
import { X, Download, FileText, CheckCircle2 } from "lucide-react";
import { Artifact, api } from "../../lib/api";

interface DocumentPreviewModalProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  artifact,
  onClose,
}) => {
  if (!artifact) return null;

  const downloadUrl = api.getDeliverableUrl(artifact.filename);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-surface border border-subtle rounded-2xl shadow-card-elevated max-w-2xl w-full max-h-[85vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-subtle flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-surface border border-subtle">
              <FileText className="w-4 h-4 text-accent-azure" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-text-primary">
                {artifact.filename}
              </h3>
              <p className="text-[10px] font-mono text-text-muted">
                Official Government Approval Note • {artifact.type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Note Sheet Header Box */}
          <div className="border border-subtle rounded-xl p-4 bg-surface-elevated space-y-2">
            <div className="flex justify-between items-center border-b border-subtle pb-2 text-[11px]">
              <span className="font-bold text-text-primary uppercase tracking-wider">
                GOVERNMENT OF INDIA / DEFENCE & INDUSTRIAL OPERATIONS
              </span>
              <span className="font-mono text-text-muted">REF: QA-88 / 2026</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-text-muted">Subject: </span>
                <strong className="text-text-primary">Turbine Unit 7 Overhaul Authorization</strong>
              </div>
              <div className="text-right">
                <span className="text-text-muted">Classification: </span>
                <strong className="text-red-500 font-mono">CONFIDENTIAL</strong>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="space-y-2 leading-relaxed text-text-primary">
            <p className="font-semibold text-[11px] text-text-muted uppercase tracking-wider">
              1. Operational Context & Findings Summary
            </p>
            <p>
              Scanned metrology and vibration inspection reports for <strong>Turbine Unit 7</strong> were evaluated against Standard Operating Procedure <strong>SOP-TURB-IND-2026-V4</strong>. Two measured parameters were found in critical breach of permitted operational envelopes:
            </p>

            {/* Findings Mini Table */}
            <div className="border border-subtle rounded-xl overflow-hidden mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-elevated border-b border-subtle text-[10px] text-text-muted uppercase">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Observed</th>
                    <th className="p-2.5">Permitted Limit</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle text-[11px]">
                  <tr>
                    <td className="p-2.5 font-medium text-text-primary">Drive-End Bearing Vibration</td>
                    <td className="p-2.5 font-mono font-bold text-red-500">4.85 mm/s</td>
                    <td className="p-2.5 font-mono text-text-secondary">3.50 mm/s</td>
                    <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-mono font-semibold">NON-COMPLIANT</span></td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-text-primary">Babbitt Temperature</td>
                    <td className="p-2.5 font-mono font-bold text-red-500">94.2 °C</td>
                    <td className="p-2.5 font-mono text-text-secondary">90.0 °C</td>
                    <td className="p-2.5"><span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-mono font-semibold">NON-COMPLIANT</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-1.5 pt-2">
            <p className="font-semibold text-[11px] text-text-muted uppercase tracking-wider">
              2. Authorized Recommendation & Action
            </p>
            <div className="p-3 rounded-xl bg-surface-elevated border border-subtle leading-relaxed text-text-primary">
              Immediate rotor de-energization, bearing sleeve replacement, and stage-2 thermal inspection authorized. Official overhaul protocol enacted.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-subtle bg-surface-elevated flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-subtle text-text-secondary hover:bg-surface text-xs font-medium transition cursor-pointer"
          >
            Close Preview
          </button>

          <a
            href={downloadUrl}
            download={artifact.filename}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-text-primary hover:bg-black text-white text-xs font-medium shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official File</span>
          </a>
        </div>
      </div>
    </div>
  );
};
