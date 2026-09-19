import React from "react";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Check, Info } from "lucide-react";

export interface VerificationItem {
  parameter_name: string;
  measured_value: number;
  threshold_value: number;
  operator: string;
  unit: string;
  status: "COMPLIANT" | "NON_COMPLIANT";
  severity?: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  rationale?: string;
  source_doc?: string;
}

interface VerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: VerificationItem[];
  onGenerateReport?: () => void;
}

export const defaultVerificationItems: VerificationItem[] = [
  {
    parameter_name: "Drive-End Bearing Vibration (RMS)",
    measured_value: 4.85,
    threshold_value: 3.50,
    operator: "<=",
    unit: "mm/s",
    status: "NON_COMPLIANT",
    severity: "CRITICAL",
    rationale: "Measured 4.85 mm/s exceeds the approved standard limit of 3.50 mm/s (Section 2.1).",
    source_doc: "Turbine Maintenance Procedure (Section 2.1)"
  },
  {
    parameter_name: "Journal Bearing Babbitt Temperature",
    measured_value: 94.2,
    threshold_value: 90.0,
    operator: "<=",
    unit: "°C",
    status: "NON_COMPLIANT",
    severity: "HIGH",
    rationale: "Measured 94.2 °C exceeds the thermal operating ceiling of 90.0 °C.",
    source_doc: "Turbine Maintenance Procedure (Section 2.2)"
  },
  {
    parameter_name: "Lubrication Oil Pressure",
    measured_value: 1.85,
    threshold_value: 1.80,
    operator: ">=",
    unit: "Bar",
    status: "COMPLIANT",
    severity: "NORMAL",
    rationale: "Measured 1.85 Bar is within the nominal operating envelope (1.80 to 2.20 Bar).",
    source_doc: "Turbine Maintenance Procedure (Section 3.4)"
  },
  {
    parameter_name: "Shaft Eccentricity Runout",
    measured_value: 0.018,
    threshold_value: 0.050,
    operator: "<=",
    unit: "mm",
    status: "COMPLIANT",
    severity: "LOW",
    rationale: "Measured 0.018 mm is within allowable mechanical runout tolerance.",
    source_doc: "Standard Mechanical Limits (Clause 5.1)"
  }
];

export const VerificationDrawer: React.FC<VerificationDrawerProps> = ({
  isOpen,
  onClose,
  items = defaultVerificationItems,
  onGenerateReport
}) => {
  if (!isOpen) return null;

  const nonCompliantCount = items.filter((i) => i.status === "NON_COMPLIANT").length;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-88 sm:w-[460px] bg-white border-l border-[#DCDAD3] shadow-sov-lg flex flex-col justify-between select-none animate-in slide-in-from-right duration-200 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-[#DCDAD3] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00A878]" />
          <div>
            <h3 className="font-semibold text-xs text-[#171717] uppercase tracking-wider">
              Verification Results
            </h3>
            <p className="text-[11px] text-[#686762]">
              {items.length} measurements checked against approved guidance
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#9E9D98] hover:text-[#171717] hover:bg-[#F0EFEA] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
        {/* Status Summary Banner */}
        <div
          className={`p-3 rounded-lg border flex items-center gap-2.5 ${
            nonCompliantCount > 0
              ? "bg-[#FEF3C7] border-[#F59E0B]/30 text-[#92400E]"
              : "bg-[#E6F7F2] border-[#00A878]/30 text-[#006B4D]"
          }`}
        >
          {nonCompliantCount > 0 ? (
            <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#00A878] shrink-0" />
          )}
          <div>
            <span className="font-semibold">
              {nonCompliantCount > 0
                ? `${nonCompliantCount} parameters require immediate attention`
                : "All measured parameters are compliant"}
            </span>
            <p className="text-[11px] mt-0.5 opacity-90">
              Verified directly against document evidence and procedure standards.
            </p>
          </div>
        </div>

        {/* Verification Items List */}
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isFail = item.status === "NON_COMPLIANT";
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border transition ${
                  isFail
                    ? "bg-[#FAF9F6] border-red-200"
                    : "bg-[#FAF9F6] border-[#DCDAD3]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-xs text-[#171717]">
                      {item.parameter_name}
                    </h4>
                    <p className="text-[11px] font-mono text-[#686762] mt-0.5">
                      Observed: <strong className="text-[#171717]">{item.measured_value} {item.unit}</strong> | Approved Limit: {item.threshold_value} {item.unit}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border shrink-0 ${
                      isFail
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-[#E6F7F2] text-[#006B4D] border-[#00A878]/30"
                    }`}
                  >
                    {isFail ? "FAIL" : "PASS"}
                  </span>
                </div>

                {item.rationale && (
                  <p className="text-[11px] text-[#686762] mt-2 pt-2 border-t border-[#DCDAD3]/60 leading-relaxed">
                    {item.rationale}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#DCDAD3] flex items-center justify-between gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded border border-[#DCDAD3] text-[#686762] hover:bg-[#FAF9F6] text-xs font-medium transition"
        >
          Close
        </button>

        {onGenerateReport && (
          <button
            onClick={() => {
              onClose();
              onGenerateReport();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#171717] hover:bg-black text-white text-xs font-medium transition shadow-2xs"
          >
            <span>Generate Official Report</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};
