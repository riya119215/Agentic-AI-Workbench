import React from "react";
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { VerificationFinding } from "../../lib/types";
export type { VerificationFinding };

interface VerificationInspectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  findings?: VerificationFinding[];
  onGenerateReport?: () => void;
}

export const defaultVerificationFindings: VerificationFinding[] = [
  {
    parameter_name: "Drive-End Bearing Vibration (RMS)",
    measured_value: "4.85 mm/s",
    threshold_value: "3.50 mm/s",
    operator: "<=",
    unit: "mm/s",
    status: "NON_COMPLIANT",
    severity: "CRITICAL",
    source_doc: "SOP-TURB-IND-2026-V4 (§2.1)",
    rationale: "Measured 4.85 mm/s exceeds the approved threshold of 3.50 mm/s. Immediate rotor de-energization required."
  },
  {
    parameter_name: "Journal Bearing Babbitt Temperature",
    measured_value: "94.2 °C",
    threshold_value: "90.0 °C",
    operator: "<=",
    unit: "°C",
    status: "NON_COMPLIANT",
    severity: "HIGH",
    source_doc: "SOP-TURB-IND-2026-V4 (§2.2)",
    rationale: "Measured 94.2 °C exceeds the thermal ceiling limit of 90.0 °C."
  },
  {
    parameter_name: "Lubrication Oil Pressure",
    measured_value: "1.85 Bar",
    threshold_value: "1.80 Bar",
    operator: ">=",
    unit: "Bar",
    status: "COMPLIANT",
    severity: "NORMAL",
    source_doc: "SOP-TURB-IND-2026-V4 (§3.4)",
    rationale: "Within nominal operating envelope."
  },
  {
    parameter_name: "Shaft Eccentricity Runout",
    measured_value: "0.018 mm",
    threshold_value: "0.050 mm",
    operator: "<=",
    unit: "mm",
    status: "COMPLIANT",
    severity: "LOW",
    source_doc: "Standard Mechanical Limits (§5.1)",
    rationale: "Within allowable mechanical runout tolerance."
  }
];

export const VerificationInspectionDrawer: React.FC<VerificationInspectionDrawerProps> = ({
  isOpen,
  onClose,
  findings = defaultVerificationFindings,
  onGenerateReport
}) => {
  if (!isOpen) return null;

  const nonCompliantCount = findings.filter((f) => f.status === "NON_COMPLIANT").length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-88 sm:w-[440px] bg-white border-l border-[#DCDAD3] shadow-card-elevated flex flex-col justify-between select-none animate-in slide-in-from-right duration-200 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#DCDAD3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00A878]" />
          <div>
            <h3 className="font-semibold text-xs text-[#171717] uppercase tracking-wider">
              Verification
            </h3>
            <p className="text-[11px] text-[#686762]">
              {findings.length} measurements checked
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#8A8881] hover:text-[#171717] hover:bg-[#F0EFEA] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
        {/* Status Summary Banner */}
        <div
          className={`p-3 rounded-lg border flex items-center gap-2.5 ${
            nonCompliantCount > 0
              ? "bg-[#FDF2F2] border-[#C83A3A]/30 text-[#C83A3A]"
              : "bg-[#E8F7F1] border-[#00A878]/30 text-[#008F68]"
          }`}
        >
          {nonCompliantCount > 0 ? (
            <AlertTriangle className="w-4 h-4 text-[#C83A3A] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#008F68] shrink-0" />
          )}
          <div>
            <span className="font-semibold">
              {nonCompliantCount > 0
                ? `${nonCompliantCount} parameters exceed approved limits`
                : "All parameters compliant"}
            </span>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-2">
          {findings.map((item, idx) => {
            const isFail = item.status === "NON_COMPLIANT";
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  isFail
                    ? "bg-[#FDF2F2]/60 border-[#C83A3A]/30"
                    : "bg-[#F7F6F2] border-[#DCDAD3]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-[#171717]">
                      {item.parameter_name}
                    </h4>
                    <p className="text-[11px] font-mono text-[#686762] mt-0.5">
                      {item.measured_value} {item.operator} {item.threshold_value}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      isFail
                        ? "bg-[#C83A3A] text-white"
                        : "bg-[#008F68] text-white"
                    }`}
                  >
                    {isFail ? "NON-COMPLIANT" : "COMPLIANT"}
                  </span>
                </div>

                {item.rationale && (
                  <p className="text-[11px] text-[#686762] pt-1 border-t border-[#DCDAD3]/60 leading-relaxed">
                    {item.rationale}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#DCDAD3] flex items-center justify-between gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg border border-[#DCDAD3] text-[#686762] hover:bg-[#F0EFEA] text-xs font-medium transition cursor-pointer"
        >
          Close
        </button>

        {onGenerateReport && (
          <button
            onClick={() => {
              onClose();
              onGenerateReport();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00A878] hover:bg-[#008F68] text-white text-xs font-medium transition cursor-pointer"
          >
            <span>Generate Report</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};
