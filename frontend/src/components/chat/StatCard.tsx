import React from "react";
import { AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert } from "lucide-react";
import { VerificationFinding } from "../../lib/types";

interface StatCardProps {
  finding: VerificationFinding;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ finding, onClick }) => {
  const isFail = finding.status === "NON_COMPLIANT";

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl border transition-all duration-200 select-none cursor-pointer ${
        isFail
          ? "bg-surface border-red-500/30 hover:border-red-500/60 shadow-2xs"
          : "bg-surface border-subtle hover:border-accent-emerald/40 shadow-2xs"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
            {finding.source_doc || "Inspection Parameter"}
          </span>
          <h4 className="text-xs font-semibold text-text-primary mt-0.5">
            {finding.parameter_name}
          </h4>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
            isFail
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
              : "bg-accent-emerald/10 text-emerald-600 dark:text-accent-emerald border-accent-emerald/30"
          }`}
        >
          {isFail ? "NON-COMPLIANT" : "COMPLIANT"}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mt-2 pt-2 border-t border-subtle">
        <span className="text-sm font-mono font-bold text-text-primary">
          {finding.measured_value} {finding.unit}
        </span>
        <span className="text-[11px] text-text-secondary font-mono">
          / Approved limit: {finding.threshold_value} {finding.unit}
        </span>
      </div>
    </div>
  );
};
