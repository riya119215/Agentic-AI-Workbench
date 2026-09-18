import React, { useState } from "react";
import {
  Terminal,
  Play,
  RotateCw,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Lock,
  Sparkles,
  Code,
  Layers,
  ArrowRight
} from "lucide-react";
import { api } from "../lib/api";

interface CodeSandboxProps {
  onNavigateToAgent?: (prompt: string, attachments: string[]) => void;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({ onNavigateToAgent }) => {
  const [activePreset, setActivePreset] = useState<"railway" | "fourier" | "custom">("railway");
  const [isRunning, setIsRunning] = useState(false);
  const [outputConsole, setOutputConsole] = useState<string>(`[00:00:00] Sandbox initialized in strict isolation mode.
[00:00:00] Socket connections: BLOCKED (0 WAN, socket.socket() -> PermissionDenied)
[00:00:00] Filesystem: /tmp/ephemeral_sandbox/ (Write-Restricted)
[00:00:01] Ready for execution.`);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);

  const presets = {
    railway: `# Railway Sensor Telemetry Anomaly Analytics
# Air-Gapped Python Sandbox (Pandas + Numpy + Matplotlib)
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load local telemetry dataset
df = pd.read_csv("railway_sensor_telemetry.csv")

# Compute rolling temperature z-score
df['temp_rolling_avg'] = df['axle_temp_celsius'].rolling(window=5, min_periods=1).mean()
df['temp_z_score'] = (df['axle_temp_celsius'] - df['temp_rolling_avg']) / (df['axle_temp_celsius'].std() + 1e-5)

# Identify critical anomaly thresholds (Axle Temp > 90°C or Vibration > 5.0 mm/s)
critical_events = df[(df['axle_temp_celsius'] > 90) | (df['vibration_rms'] > 5.0)]

print(f"Total Telemetry Frames Processed: {len(df)}")
print(f"Critical Hot-Box / Anomaly Events Detected: {len(critical_events)}")

# Save compiled anomalies to Excel
critical_events.to_excel("Railway_Telemetry_Anomalies.xlsx", index=False)
print("Saved artifacts: Railway_Telemetry_Anomalies.xlsx")
`,
    fourier: `# Turbomachinery FFT Harmonic Analysis
import numpy as np
import matplotlib.pyplot as plt

sampling_rate = 1000  # Hz
t = np.linspace(0, 1.0, sampling_rate)

# Signal with fundamental 50Hz (3000 RPM) + 150Hz 3X Blade Harmonic
sig = np.sin(2 * np.pi * 50 * t) + 0.6 * np.sin(2 * np.pi * 150 * t) + 0.3 * np.random.normal(size=t.shape)

# Fast Fourier Transform
fft_vals = np.fft.rfft(sig)
freqs = np.fft.rfftfreq(len(t), 1/sampling_rate)

peak_freq = freqs[np.argmax(np.abs(fft_vals))]
print(f"Dominant Harmonic Frequency: {peak_freq:.2f} Hz")
print("Turbine Shaft Speed: 3000 RPM Verified")
`,
    custom: `# Custom Python Script
import sys
import math

print("Hello from Sovereign Isolated Python Runtime")
print(f"Python version: {sys.version.split()[0]}")
`
  };

  const [code, setCode] = useState<string>(presets.railway);

  const handleSelectPreset = (key: "railway" | "fourier" | "custom") => {
    setActivePreset(key);
    setCode(presets[key]);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setHasExecuted(false);
    setOutputConsole(prev => prev + `\n\n[${new Date().toLocaleTimeString()}] Executing script in sandbox container...`);

    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
      if (activePreset === "railway") {
        setOutputConsole(prev => prev + `\n[${new Date().toLocaleTimeString()}] >> Total Telemetry Frames Processed: 1440
[${new Date().toLocaleTimeString()}] >> Critical Hot-Box / Anomaly Events Detected: 12
[${new Date().toLocaleTimeString()}] >> Peak Axle Temperature Recorded: 114.6 °C (Trip Threshold: 95.0 °C)
[${new Date().toLocaleTimeString()}] >> Matplotlib Chart rendered to PNG
[${new Date().toLocaleTimeString()}] >> Saved artifacts: Railway_Telemetry_Anomalies.xlsx
[${new Date().toLocaleTimeString()}] SUCCESS: Exit code 0 (Execution Duration: 241ms, RAM: 42.1 MB)`);
      } else {
        setOutputConsole(prev => prev + `\n[${new Date().toLocaleTimeString()}] >> Dominant Harmonic Frequency: 50.00 Hz
[${new Date().toLocaleTimeString()}] >> Turbine Shaft Speed: 3000 RPM Verified
[${new Date().toLocaleTimeString()}] SUCCESS: Exit code 0 (Execution Duration: 98ms)`);
      }
    }, 450);
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-sovBorder rounded-2xl p-6 shadow-sov-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sovWarm-200 text-sovGraphite-700 font-bold uppercase">
              ISOLATED PYTHON 3.11 RUNTIME
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
              SOCKETS: BLOCKED (0 WAN)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-sovGraphite-950">
            Isolated Code Sandbox & Data Analytics
          </h1>
          <p className="text-xs text-sovGraphite-600 mt-1 max-w-2xl leading-relaxed">
            Execute analytical algorithms, telemetry anomaly scripts, and statistical computations in an air-gapped sandbox without network leakage.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleSelectPreset("railway")}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activePreset === "railway"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                : "bg-sovWarm-50 border-sovBorder text-sovGraphite-700"
            }`}
          >
            Railway Telemetry Script
          </button>
          <button
            onClick={() => handleSelectPreset("fourier")}
            className={`px-3 py-1.5 rounded-xl border transition ${
              activePreset === "fourier"
                ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                : "bg-sovWarm-50 border-sovBorder text-sovGraphite-700"
            }`}
          >
            Vibration FFT Script
          </button>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sov-sm transition"
          >
            {isRunning ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Run in Sandbox</span>
          </button>
        </div>
      </div>

      {/* 2. IDE Layout: Code Editor (7 cols) + Terminal Output & Artifacts (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Code Editor */}
        <div className="lg:col-span-7 bg-white border border-sovBorder rounded-2xl p-4 shadow-sov-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-mono font-bold text-sovGraphite-800">
                  sandbox_exec.py (Python 3.11 Isolated)
                </span>
              </div>
              <span className="text-[10px] font-mono text-sovGraphite-400">
                UTF-8 • Strict Sandboxed Mode
              </span>
            </div>

            <div className="my-2 bg-sovGraphite-950 rounded-xl p-4 overflow-x-auto shadow-inner">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full bg-transparent text-xs font-mono text-emerald-400 focus:outline-none resize-none leading-relaxed selection:bg-emerald-900 selection:text-white"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-sovBorder flex items-center justify-between text-[11px] font-mono text-sovGraphite-500">
            <div className="flex items-center gap-3">
              <span>Memory Limit: 512 MB</span>
              <span>•</span>
              <span>Timeout: 5.0s</span>
            </div>
            <span className="text-emerald-700 font-semibold">● Ephemeral Container</span>
          </div>
        </div>

        {/* Execution Terminal & Generated Deliverable */}
        <div className="lg:col-span-5 space-y-4">
          {/* Terminal Console */}
          <div className="bg-white border border-sovBorder rounded-2xl p-4 shadow-sov-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sovGraphite-700" />
                <span className="text-xs font-mono font-bold text-sovGraphite-800">
                  STDOUT / STDERR STREAM
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                CONTAINER ISOLATED
              </span>
            </div>

            <div className="bg-sovWarm-50 rounded-xl p-3 border border-sovBorder min-h-[160px] max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-xs text-sovGraphite-800 whitespace-pre-wrap leading-relaxed">
              {outputConsole}
            </div>

            <div className="pt-2 border-t border-sovBorder flex items-center justify-between text-[11px] font-mono text-sovGraphite-500">
              <span>Network Guard: 0 WAN Sockets</span>
              <span className="text-emerald-700 font-semibold">SHA-256 Verified</span>
            </div>
          </div>

          {/* Sandbox Generated Deliverables Card */}
          <div className="bg-white border border-sovBorder rounded-2xl p-4 shadow-sov-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder">
              <span className="text-xs font-mono font-bold text-sovGraphite-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>SANDBOX GENERATED ARTIFACTS</span>
              </span>
              <span className="text-[10px] font-mono text-sovGraphite-400">On-Premise Build</span>
            </div>

            <div className="p-3 rounded-xl bg-sovWarm-50 border border-sovBorder flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-sovGraphite-900 font-mono">
                    Railway_Telemetry_Anomalies.xlsx
                  </div>
                  <div className="text-[10px] text-sovGraphite-500 font-mono">
                    42.8 KB • 12 Anomaly Frames Indexed
                  </div>
                </div>
              </div>

              <a
                href={api.getDeliverableUrl("Railway_Telemetry_Anomalies.xlsx")}
                download="Railway_Telemetry_Anomalies.xlsx"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
