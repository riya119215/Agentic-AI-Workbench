import React, { useState, useEffect } from "react";
import {
  Search,
  Bot,
  Database,
  Cpu,
  ShieldCheck,
  Terminal,
  Layers,
  FileCheck,
  Zap,
  Activity,
  X,
  ArrowRight,
  Sparkles,
  Lock,
  Radio,
  Eye,
  GitFork,
  Plus
} from "lucide-react";
import { PrimaryRoute } from "./TopBar";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoute: (route: PrimaryRoute) => void;
  onOpenWorkspace: (id: string, name: string) => void;
  onExecuteScenario: (id: string, prompt: string, attachments: string[]) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectRoute,
  onOpenWorkspace,
  onExecuteScenario,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: "PRIMARY WORKSPACES",
      items: [
        { id: "workspace", title: "Workspace Hub", desc: "View recent cases and active tasks", icon: Sparkles, type: "nav" },
        { id: "agents", title: "Agent Studio", desc: "Execute reasoning agents & on-premise tasks", icon: Bot, type: "nav" },
        { id: "knowledge", title: "Knowledge Hub", desc: "Search local ChromaDB vectors & SOP documents", icon: Database, type: "nav" },
        { id: "models", title: "Model Control Center", desc: "Inspect local model router & Ollama loopback", icon: Cpu, type: "nav" },
        { id: "vision", title: "Vision & Scans", desc: "Inspect scanned PDF notes and defect photos", icon: Eye, type: "nav" },
        { id: "workflows", title: "Workflow Builder", desc: "Construct visual multi-agent DAG pipelines", icon: GitFork, type: "nav" },
      ]
    },
    {
      category: "FLAGSHIP SIH DEMONSTRATIONS",
      items: [
        {
          id: "demo-1",
          title: "Demo 1: Scanned Inspection → SOP RAG → DOCX Note",
          desc: "Extract OCR and compile official Government Approval Note",
          icon: FileCheck,
          type: "demo",
          prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul.",
          attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
        },
        {
          id: "demo-2",
          title: "Demo 2: Railway Telemetry → Python Sandbox → Excel Sheet",
          desc: "Execute anomaly detection in isolated sandbox and generate XLSX",
          icon: Terminal,
          type: "demo",
          prompt: "Analyze railway_sensor_telemetry.csv inside the isolated Python sandbox. Identify high-risk axle anomalies, plot degradation curves, and compile a summary Excel spreadsheet.",
          attachments: ["railway_sensor_telemetry.csv"]
        },
        {
          id: "demo-3",
          title: "Demo 3: Multi-Evidence Suite (.docx + .xlsx + .pptx)",
          desc: "Cross-correlate PDF, CSV, and photos into full deliverable suite",
          icon: Layers,
          type: "demo",
          prompt: "Analyze all available evidence: inspection.pdf, railway_sensor_telemetry.csv, and photo.jpg. Prepare full deliverable suite (.docx, .xlsx, .pptx).",
          attachments: ["INSPECTION_REPORT_TURBINE_UNIT_7.txt", "railway_sensor_telemetry.csv", "bearing_cavitation_scan.png"]
        }
      ]
    },
    {
      category: "GOVERNANCE & TELEMETRY",
      items: [
        { id: "deliverables", title: "Deliverables & Artifacts", desc: "Browse and download compiled .docx, .xlsx, .pptx files", icon: Layers, type: "nav" },
        { id: "security", title: "Security Center & Audit Ledger", desc: "Inspect 0-WAN sockets and SHA-256 cryptographic chain", icon: ShieldCheck, type: "nav" },
        { id: "system", title: "Hardware Profiler", desc: "View real-time CPU, RAM, and SHA-256 throughput benchmarks", icon: Activity, type: "nav" },
      ]
    }
  ];

  const filteredGroups = actions.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  const handleSelect = (item: any) => {
    if (item.type === "nav") {
      onSelectRoute(item.id as PrimaryRoute);
    } else if (item.type === "demo") {
      onExecuteScenario(item.id, item.prompt, item.attachments);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-sovGraphite-950/30 backdrop-blur-xs flex items-start justify-center pt-[12vh] px-4">
      <div className="bg-white rounded-2xl border border-sovBorder shadow-sov-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-sovBorder gap-3">
          <Search className="w-4 h-4 text-sovGraphite-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or choose a scenario..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-sovGraphite-900 placeholder-sovGraphite-400 focus:outline-none font-sans"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-sovGraphite-400 hover:text-sovGraphite-700">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="font-mono text-[10px] bg-sovWarm-100 border border-sovBorder px-1.5 py-0.5 rounded text-sovGraphite-500 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar space-y-3">
          {filteredGroups.length === 0 ? (
            <div className="py-8 text-center text-sovGraphite-400 text-xs font-mono">
              No matching commands.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category}>
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-sovGraphite-400 uppercase tracking-wider">
                  {group.category}
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-sovWarm-50 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-md bg-sovWarm-100 text-sovGraphite-600 group-hover:bg-emerald-50 group-hover:text-emerald-800 transition">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-sovGraphite-900 group-hover:text-emerald-800 transition truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-sovGraphite-500 truncate font-sans">{item.desc}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-sovGraphite-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-sovWarm-50 border-t border-sovBorder flex items-center justify-between text-[11px] text-sovGraphite-500 font-mono">
          <span>↑↓ Navigate • ↵ Select</span>
          <span className="text-emerald-700 font-semibold">Strict Local Node</span>
        </div>
      </div>
    </div>
  );
};
