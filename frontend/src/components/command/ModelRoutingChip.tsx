import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, Sparkles, Eye, CheckCircle2 } from "lucide-react";
import { ModelRoutingInfo } from "../../lib/types";

interface ModelRoutingChipProps {
  routingInfo?: ModelRoutingInfo | null;
}

export const ModelRoutingChip: React.FC<ModelRoutingChipProps> = ({ routingInfo }) => {
  if (!routingInfo) return null;

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "code":
        return <Terminal className="w-3.5 h-3.5 text-accent-azure" />;
      case "vision":
        return <Eye className="w-3.5 h-3.5 text-accent-violet" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-accent-emerald" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-subtle shadow-glow-sm text-xs font-mono select-none"
      >
        <span className="text-text-muted">Routed to:</span>
        <div className="flex items-center gap-1.5 font-semibold text-text-primary">
          {getIcon(routingInfo.task_type)}
          <span>{routingInfo.selected_model}</span>
        </div>
        <span className="px-1.5 py-0.2 rounded text-[10px] bg-surface-elevated text-accent-primary border border-subtle uppercase">
          {routingInfo.task_type}
        </span>
        <span className="text-[10px] text-text-muted hidden sm:inline">
          ({routingInfo.backend})
        </span>
      </motion.div>
    </AnimatePresence>
  );
};
