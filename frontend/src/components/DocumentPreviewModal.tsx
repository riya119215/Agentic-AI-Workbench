import React from "react";
import { X, Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { Artifact, api } from "../lib/api";

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
    <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-150">
      <div className="bg-white border border-[#DCDAD3] rounded-lg shadow-sov-lg max-w-2xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#DCDAD3] flex items-center justify-between bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-white border border-[#DCDAD3]">
              <FileText className="w-4 h-4 text-[#00A878]" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-[#171717]">
                {artifact.filename}
              </h3>
              <span className="text-[10px] font-mono text-[#686762]">
                Official Government Approval Note Sheet • {artifact.type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9E9D98] hover:text-[#171717] hover:bg-[#F0EFEA] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formatted Document Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Note Sheet Header Box */}
          <div className="border border-[#DCDAD3] rounded-md p-4 bg-[#FAF9F6] space-y-2">
            <div className="flex justify-between items-center border-b border-[#DCDAD3] pb-2 text-[11px]">
              <span className="font-bold text-[#171717] uppercase tracking-wider">
                GOVERNMENT OF INDIA / DEFENCE & INDUSTRIAL OPERATIONS
              </span>
              <span className="font-mono text-[#686762]">REF: QA-88 / 2026</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-[#686762]">Subject: </span>
                <strong className="text-[#171717]">Turbine Unit 7 Overhaul Authorization</strong>
              </div>
              <div className="text-right">
                <span className="text-[#686762]">Classification: </span>
                <strong className="text-red-700 font-mono">CONFIDENTIAL</strong>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="space-y-2 leading-relaxed text-[#171717]">
            <p className="font-semibold text-[11px] text-[#686762] uppercase tracking-wider">
              1. Operational Context & Findings Summary
            </p>
            <p>
              Scanned metrology and vibration inspection reports for <strong>Turbine Unit 7</strong> were evaluated against Standard Operating Procedure <strong>SOP-TURB-IND-2026-V4</strong>. Two measured parameters were found in critical breach of permitted operational envelopes:
            </p>

            {/* Findings Mini Table */}
            <div className="border border-[#DCDAD3] rounded overflow-hidden mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF9F6] border-b border-[#DCDAD3] text-[10px] text-[#686762] uppercase">
                  <tr>
                    <th className="p-2">Parameter</th>
                    <th className="p-2">Observed</th>
                    <th className="p-2">Permitted Limit</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDAD3] text-[11px]">
                  <tr>
                    <td className="p-2 font-medium">Drive-End Bearing Vibration</td>
                    <td className="p-2 font-mono font-bold text-red-700">4.85 mm/s</td>
                    <td className="p-2 font-mono text-[#686762]">3.50 mm/s</td>
                    <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-mono font-semibold">NON-COMPLIANT</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Babbitt Temperature</td>
                    <td className="p-2 font-mono font-bold text-red-700">94.2 °C</td>
                    <td className="p-2 font-mono text-[#686762]">90.0 °C</td>
                    <td className="p-2"><span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-mono font-semibold">NON-COMPLIANT</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-1.5 pt-2">
            <p className="font-semibold text-[11px] text-[#686762] uppercase tracking-wider">
              2. Authorized Recommendation & Action
            </p>
            <div className="p-3 rounded bg-[#FAF9F6] border border-[#DCDAD3] leading-relaxed">
              Immediate rotor de-energization, bearing sleeve replacement, and stage-2 thermal inspection authorized. Official overhaul protocol enacted.
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="pt-3 border-t border-[#DCDAD3] flex items-center justify-between text-[10px] font-mono text-[#686762]">
            <span className="flex items-center gap-1.5 text-[#006B4D]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A878]" />
              <span>Cryptographic Provenance Verified • SIH26117</span>
            </span>
            <span>Air-Gapped Sovereign Node</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-[#DCDAD3] bg-[#FAF9F6] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-[#DCDAD3] text-[#686762] hover:bg-white text-xs font-medium transition"
          >
            Close Preview
          </button>

          <a
            href={downloadUrl}
            download={artifact.filename}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official File</span>
          </a>
        </div>
      </div>
    </div>
  );
};
