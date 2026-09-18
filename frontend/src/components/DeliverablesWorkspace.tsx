import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Download,
  Search,
  CheckCircle2
} from "lucide-react";
import { api } from "../lib/api";

export const DeliverablesWorkspace: React.FC = () => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("" );

  const deliverables = [
    {
      filename: "Inspection_Approval_Note_Turbine_Unit_7.docx",
      title: "Government Approval Note — Emergency Turbine Overhaul",
      type: "DOCX",
      size_bytes: 42800,
      timestamp: "Today, 08:15 IST",
      department: "Turbomachinery QA",
      status: "Approved & Signed",
      source: "SOP-TURB-IND-2026-V4 Validation",
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    },
    {
      filename: "Railway_Telemetry_Anomalies.xlsx",
      title: "Railway Sensor Hot-Box & Axle Vibration Telemetry Analysis",
      type: "XLSX",
      size_bytes: 38400,
      timestamp: "Today, 08:12 IST",
      department: "Rolling Stock Safety",
      status: "Computed in Sandbox",
      source: "railway_sensor_telemetry.csv (1440 frames)",
      hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
    },
    {
      filename: "Executive_Briefing_Turbomachinery_Defects.pptx",
      title: "Executive Strategic Briefing — Asset Integrity & Cavitation Risk",
      type: "PPTX",
      size_bytes: 124000,
      timestamp: "Today, 08:10 IST",
      department: "Strategic Assets",
      status: "Ready",
      source: "Multi-Evidence Synthesis",
      hash: "3858f62230ac3c915f300c664312c63f43b517d10c593a241167acc30794383c"
    },
    {
      filename: "Bearing_Cavitation_Micro_Assessment.png",
      title: "Journal Bearing #3 Optical Cavitation Pitting Analysis Plot",
      type: "PNG",
      size_bytes: 84200,
      timestamp: "Today, 08:05 IST",
      department: "Metrology Lab",
      status: "Verified",
      source: "DEF-STD-05-21 Cavitation Scan",
      hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb"
    }
  ];

  const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "DOCX":
        return <FileText className="w-4 h-4 text-sovBlue-600" />;
      case "XLSX":
      case "CSV":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "PPTX":
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case "PNG":
      case "JPG":
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-sovGraphite-500" />;
    }
  };

  const filteredDeliverables = deliverables.filter(d => {
    const matchesType = filterType === "ALL" || d.type === filterType;
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sovBorder">
        <div>
          <h1 className="text-xl font-semibold text-sovGraphite-950">
            Deliverables
          </h1>
          <p className="text-xs text-sovGraphite-500 mt-0.5">
            Compiled official notes, spreadsheets, and executive briefing presentations.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 text-xs">
          {["ALL", "DOCX", "XLSX", "PPTX", "PNG"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === t
                  ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                  : "text-sovGraphite-500 hover:text-sovGraphite-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Deliverables List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-semibold text-sovGraphite-900">
            Generated files
          </span>
          <span className="text-[11px] text-sovGraphite-400">
            {filteredDeliverables.length} files available
          </span>
        </div>

        <div className="bg-white border border-sovBorder rounded-xl divide-y divide-sovBorder-subtle overflow-hidden">
          {filteredDeliverables.map((item, idx) => {
            const downloadUrl = api.getDeliverableUrl(item.filename);
            return (
              <div
                key={idx}
                className="p-4 hover:bg-sovWarm-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-sovWarm-100 shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-sovGraphite-950 truncate">
                        {item.filename}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sovWarm-100 text-sovGraphite-500">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-sovGraphite-600">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-sovGraphite-400 font-mono">
                      {item.department} · {item.timestamp} · SHA-256 Verified
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={downloadUrl}
                    download={item.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
