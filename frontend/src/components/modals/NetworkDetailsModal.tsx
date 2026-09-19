import React from "react";
import { X, Check } from "lucide-react";

interface NetworkDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkDetailsModal: React.FC<NetworkDetailsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const protections = [
    "Local processing",
    "External WAN connections: 0",
    "Evidence protection active",
    "Approval controls active",
    "Audit integrity verified",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/25 flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-[#DCDAD3] rounded-xl shadow-card-elevated max-w-sm w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#DCDAD3]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00A878]" />
            <h3 className="font-semibold text-xs text-[#171717]">
              Protected Environment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A8881] hover:text-[#171717] p-1 rounded-md hover:bg-[#F0EFEA] transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Protection Checklist */}
        <div className="space-y-2 text-xs">
          {protections.map((item) => (
            <div key={item} className="flex items-center gap-2 text-[#171717]">
              <span className="w-4 h-4 rounded-full bg-[#E8F7F1] text-[#008F68] flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#DCDAD3] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#00A878] hover:bg-[#008F68] text-white text-xs font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
