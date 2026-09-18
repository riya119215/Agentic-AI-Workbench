import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  FileText,
  Sparkles,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react";

interface VisionWorkspaceProps {
  onNavigateToAgent: (prompt: string, attachments: string[]) => void;
}

export const VisionWorkspace: React.FC<VisionWorkspaceProps> = ({ onNavigateToAgent }) => {
  const [selectedSample, setSelectedSample] = useState<"bearing" | "turbine" | "drawing">("bearing");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const sampleData = {
    bearing: {
      title: "Journal Bearing Cavitation Scan",
      filename: "bearing_cavitation_scan.png",
      category: "Optical Metrology",
      ocrText: `METROLOGICAL SCAN ANALYSIS - BABBIT BEARING
Component: High-Pressure Journal Bearing #3
Inspection Standard: DEF-STD-05-21-QA
Optical Magnification: 200X
Detected Pitting Depth: 1.24 mm (±0.05)
Surface Micro-Cracking: Present (Zone B)
Material: White Metal Tin-Babbit (Grade 2)`,
      findings: [
        { severity: "Critical", text: "Cavitation depth of 1.24mm exceeds statutory limit (0.80mm max) under DEF-STD-05-21." },
        { severity: "Warning", text: "Localized thermal micro-cracking observed in quadrant 2 babbit surface." },
        { severity: "Action", text: "Immediate emergency machining and babbit re-lining required prior to recommissioning." }
      ],
      prompt: "Analyze scanned defect photograph for journal bearing cavitation and evaluate against defence standards."
    },
    turbine: {
      title: "Scanned Turbine Inspection Report",
      filename: "INSPECTION_REPORT_TURBINE_UNIT_7.txt",
      category: "Document OCR",
      ocrText: `OFFICIAL INSPECTION MEMORANDUM
Asset ID: TURB-GEN-U7-EAST
Timestamp: 2026-09-15 08:30 IST
Inspection Officer: Cmdr. R. Verma (Badge #9281)
Operating RPM: 3000 RPM
Radial Vibration: 7.82 mm/s RMS (EXCEEDS 4.5 mm/s)
Thrust Bearing Temperature: 114.6°C (EXCEEDS 95°C)
Overall Assessment: NON-COMPLIANT`,
      findings: [
        { severity: "Critical", text: "Vibration level 7.82 mm/s surpasses emergency threshold (7.1 mm/s) under SOP Clause 7.2.1." },
        { severity: "Critical", text: "Thrust bearing temperature 114.6°C exceeds 110°C trip limit under SOP Clause 8.4." },
        { severity: "Action", text: "Issue official Government Approval Note (.docx) for emergency overhaul within 48h." }
      ],
      prompt: "Analyze this scanned inspection report for Unit 7 Turbine against our internal SOP-TURB-IND-2026-V4 and generate an official Government Approval Note (.docx) for emergency overhaul."
    },
    drawing: {
      title: "Engineering Clearance Blueprint",
      filename: "schematic_clearance_diagram.png",
      category: "Technical Blueprint",
      ocrText: `ENGINEERING SCHEMATIC TOLERANCE TABLE
Drawing Reference: DWG-NAV-882-REV3
Shaft Nominal Diameter: 320.00 mm
Clearance Tolerance: +0.035 / -0.010 mm
Axial Float Allowance: 0.12 - 0.18 mm
Seal Gap Specified: 0.25 mm`,
      findings: [
        { severity: "Normal", text: "Axial float dimensions aligned with standard naval blueprint tolerances." },
        { severity: "Warning", text: "Seal gap tolerance requires re-measurement during dynamic thermal expansion." }
      ],
      prompt: "Verify engineering drawing tolerances against turbomachinery clearance standards."
    }
  };

  const currentData = sampleData[selectedSample];

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans">
      {/* 1. Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sovBorder">
        <div>
          <h1 className="text-xl font-semibold text-sovGraphite-950">
            Vision & Scans
          </h1>
          <p className="text-xs text-sovGraphite-500 mt-0.5">
            Local optical OCR, defect detection, and engineering drawing analysis.
          </p>
        </div>

        {/* Sample Selector Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedSample("bearing")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSample === "bearing"
                ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                : "text-sovGraphite-500 hover:text-sovGraphite-900 hover:bg-sovWarm-100"
            }`}
          >
            Bearing scan
          </button>
          <button
            onClick={() => setSelectedSample("turbine")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSample === "turbine"
                ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                : "text-sovGraphite-500 hover:text-sovGraphite-900 hover:bg-sovWarm-100"
            }`}
          >
            Turbine memo
          </button>
          <button
            onClick={() => setSelectedSample("drawing")}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSample === "drawing"
                ? "bg-sovWarm-200 text-sovGraphite-950 font-medium"
                : "text-sovGraphite-500 hover:text-sovGraphite-900 hover:bg-sovWarm-100"
            }`}
          >
            Blueprint
          </button>
        </div>
      </div>

      {/* 2. Visual Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* COLUMN 1: Original Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-sovBorder rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle">
              <span className="text-xs font-semibold text-sovGraphite-900">
                Original
              </span>
              <div className="flex items-center gap-1.5 text-xs text-sovGraphite-600">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                  className="p-1 rounded hover:bg-sovWarm-100"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                  className="p-1 rounded hover:bg-sovWarm-100"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dominant Image/Document Canvas */}
            <div className="my-3 rounded-lg bg-sovWarm-100 p-8 min-h-[360px] flex items-center justify-center overflow-hidden">
              <div
                style={{ transform: `scale(${zoomLevel / 100})` }}
                className="transition-transform duration-150 p-6 bg-white rounded-xl shadow-2xs border border-sovBorder max-w-sm w-full text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-lg bg-sovWarm-100 flex items-center justify-center mx-auto text-sovGraphite-700">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-sovGraphite-900">
                    {currentData.filename}
                  </h3>
                  <p className="text-[11px] text-sovGraphite-400 mt-0.5">
                    {currentData.category}
                  </p>
                </div>
                <div className="p-2.5 rounded-md bg-sovWarm-50 text-[11px] text-sovGraphite-600 text-left space-y-0.5 font-mono">
                  <div>Resolution: 2400 × 1800 px</div>
                  <div>Format: Grayscale Metrology</div>
                  <div>Status: Local Storage</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-sovBorder-subtle text-[11px] text-sovGraphite-400 flex items-center justify-between">
            <span>PaddleOCR Local Engine</span>
            <span className="text-emerald-700 font-medium">100% on-premise</span>
          </div>
        </div>

        {/* COLUMN 2: OCR Extracted Text & Findings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Extracted Text */}
          <div className="bg-white border border-sovBorder rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle">
              <span className="text-xs font-semibold text-sovGraphite-900">
                Extracted text
              </span>
              <span className="text-[11px] text-sovGraphite-400 font-mono">
                PaddleOCR v4
              </span>
            </div>

            <div className="p-3 rounded-lg bg-sovWarm-50 max-h-[160px] overflow-y-auto custom-scrollbar font-mono text-xs text-sovGraphite-800 whitespace-pre-wrap leading-relaxed">
              {currentData.ocrText}
            </div>
          </div>

          {/* AI Findings */}
          <div className="bg-white border border-sovBorder rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle">
              <span className="text-xs font-semibold text-sovGraphite-900">
                Findings
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                Verified
              </span>
            </div>

            <div className="space-y-2">
              {currentData.findings.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-sovWarm-50 text-xs space-y-0.5"
                >
                  <div className="text-[11px] font-semibold text-sovGraphite-900">
                    {f.severity}
                  </div>
                  <p className="text-sovGraphite-600 leading-relaxed">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-sovBorder-subtle">
              <button
                onClick={() => onNavigateToAgent(currentData.prompt, [currentData.filename])}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white text-xs font-medium transition"
              >
                <span>Compile Approval Note in Agent Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
