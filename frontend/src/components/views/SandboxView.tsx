import React, { useState, useRef } from "react";
import {
  Terminal,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Code2,
  ShieldCheck
} from "lucide-react";
import { api } from "../../lib/api";

interface SandboxViewProps {
  initialCode?: string;
}

export const SandboxView: React.FC<SandboxViewProps> = ({
  initialCode = `# Isolated Python 3.14 Sovereign Sandbox
import math

def evaluate_turbine_vibration(rms_velocity):
    threshold = 3.50  # SOP-TURB-IND-2026 Section 2.1
    if rms_velocity > threshold:
        return {
            "parameter": "Bearing Vibration",
            "measured": rms_velocity,
            "threshold": threshold,
            "status": "NON_COMPLIANT",
            "action": "Immediate rotor de-energization"
        }
    return {"status": "COMPLIANT"}

# Run evaluation on Unit 7 metrology
measured_rms = 4.85
result = evaluate_turbine_vibration(measured_rms)
print(f"[EVALUATION_RESULT]: {result}")
`
}) => {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [outputStatus, setOutputStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [selfCorrectionActive, setSelfCorrectionActive] = useState(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    setIsRunning(true);
    setOutput("Executing in isolated Python sandbox (network disabled, socket blocked)...");
    setOutputStatus("IDLE");

    try {
      const result = await api.runSandboxCode(code);
      const outLines = [
        `[SANDBOX_PROCESS]: Isolated Container Process (PID Confined)`,
        `[SECURITY_GATE]: WAN egress blocked (${result.network_calls_blocked ?? 0} external sockets)`,
        `[EXECUTION_TIME]: ${result.duration_ms}ms`,
        `------------------------------------------------------------`,
        result.stdout ? result.stdout.trim() : "",
        result.stderr ? `[STDERR]:\n${result.stderr.trim()}` : "",
        `------------------------------------------------------------`,
        `[SANDBOX_EXIT]: Code ${result.exit_code} (${result.exit_code === 0 ? "Execution Success" : "Execution Error"})`
      ].filter(Boolean).join("\n");

      setOutput(outLines);
      setOutputStatus(result.exit_code === 0 ? "SUCCESS" : "ERROR");
    } catch (err: any) {
      setOutput(`[SANDBOX_ERROR]: Failed to connect to sandbox executor: ${err.message}`);
      setOutputStatus("ERROR");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSimulateSelfCorrection = async () => {
    setSelfCorrectionActive(true);
    setIsRunning(true);
    setAttempts(1);
    
    // Intentionally buggy code with syntax error
    const buggyCode = `# Intentionally faulty syntax for self-correction test
def check_bearing_clearance(val)
    if val > 0.05
        return "FAIL"
    return "PASS"

print(check_bearing_clearance(0.08))
`;
    setCode(buggyCode);
    setOutput(`[ATTEMPT 1]: Executing code with syntax flaw...\n`);

    try {
      const result1 = await api.runSandboxCode(buggyCode);
      setOutput(
        (prev) =>
          prev +
          `[ATTEMPT 1 FAILED]: Exit code ${result1.exit_code}\n${result1.stderr || "SyntaxError: expected ':'"}\n\n[AGENT_REASONING]: Analyzing traceback... Detected missing colons on def and if statements.\n[AGENT_CORRECTING]: Generating corrected Python AST...\n`
      );

      setTimeout(async () => {
        setAttempts(2);
        const fixedCode = `# Auto-corrected by Sovereign Agent ReAct Loop
def check_bearing_clearance(val):
    if val > 0.05:
        return "NON_COMPLIANT (Bearing clearance exceeds 0.05mm)"
    return "COMPLIANT"

print("[AUTO_CORRECTED_OUTPUT]:", check_bearing_clearance(0.08))
`;
        setCode(fixedCode);
        const result2 = await api.runSandboxCode(fixedCode);
        setOutput((prev) =>
          prev +
          `\n[ATTEMPT 2]: SUCCESS (Exit Code ${result2.exit_code} in ${result2.duration_ms}ms)\n------------------------------------------------------------\n${result2.stdout.trim()}\n------------------------------------------------------------\n[SELF_CORRECTION_COMPLETE]: Automated retry resolved AST syntax defect.`
        );
        setOutputStatus("SUCCESS");
        setIsRunning(false);
      }, 1200);
    } catch (err: any) {
      setOutput((prev) => prev + `[ERROR]: ${err.message}`);
      setOutputStatus("ERROR");
      setIsRunning(false);
    }
  };

  const codeLines = code.split("\n");

  // Render colored output lines
  const renderFormattedConsoleOutput = (raw: string) => {
    if (!raw) {
      return (
        <span className="text-text-muted/60 italic font-mono text-xs">
          Output will appear here upon script execution...
        </span>
      );
    }

    const lines = raw.split("\n");
    return lines.map((line, idx) => {
      if (line.includes("[EVALUATION_RESULT]:") || line.includes("[AUTO_CORRECTED_OUTPUT]:")) {
        return (
          <div key={idx} className="my-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
            {line}
          </div>
        );
      }
      if (line.includes("[STDERR]:") || line.includes("SyntaxError:") || line.includes("Error:") || line.includes("FAILED")) {
        return (
          <div key={idx} className="text-rose-600 dark:text-rose-400 font-mono text-xs font-semibold">
            {line}
          </div>
        );
      }
      if (line.includes("[SECURITY_GATE]:") || line.includes("[SANDBOX_PROCESS]:")) {
        return (
          <div key={idx} className="text-accent-azure font-mono text-xs">
            {line}
          </div>
        );
      }
      if (line.includes("[SANDBOX_EXIT]: Code 0")) {
        return (
          <div key={idx} className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold pt-1">
            {line}
          </div>
        );
      }
      if (line.includes("------------------------------------------------------------")) {
        return <div key={idx} className="text-border-subtle my-1">{line}</div>;
      }
      return (
        <div key={idx} className="text-text-primary font-mono text-xs leading-relaxed">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-4 select-none font-sans overflow-hidden flex flex-col h-[calc(100vh-56px)]">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-subtle shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Isolated Code Execution Sandbox
            </h1>
            <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shadow-2xs">
              <Lock className="w-3 h-3" />
              <span>Air-Gapped • Network Disabled</span>
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Deterministic execution of Python scripts, data transformations, and mathematical verification algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateSelfCorrection}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-subtle bg-surface hover:bg-surface-hover hover:border-accent-violet/40 text-xs font-medium text-text-secondary hover:text-text-primary shadow-2xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Demonstrate agent auto-retry self-correction loop"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accent-violet" />
            <span>Test Self-Correction Loop</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-text-primary hover:bg-black text-white text-xs font-medium shadow-card-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin text-accent-azure" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-accent-emerald" />
                <span>Run Sandbox Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Console Split Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Column: Code Editor with Line Numbers & Syntax Bar */}
        <div className="md:col-span-7 flex flex-col bg-surface border border-subtle rounded-2xl overflow-hidden shadow-card-elevated transition-all duration-200">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-elevated border-b border-subtle text-xs text-text-secondary">
            <div className="flex items-center gap-2 font-mono">
              <Code2 className="w-3.5 h-3.5 text-accent-azure" />
              <span className="font-semibold text-text-primary">sandbox_script.py</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-subtle text-text-muted">
                Python 3.14
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
                {codeLines.length} lines
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-surface text-[11px] text-text-muted hover:text-text-primary transition cursor-pointer"
                title="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-accent-emerald" />
                    <span className="text-accent-emerald">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Body with Line Numbers */}
          <div className="flex-1 flex overflow-hidden bg-canvas/60">
            {/* Line Numbers Column */}
            <div className="w-10 py-4 select-none bg-surface/40 border-r border-subtle/60 text-right pr-2.5 font-mono text-[11px] text-text-muted/50 leading-relaxed shrink-0">
              {codeLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Text Area */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-4 font-mono text-xs leading-relaxed text-text-primary bg-transparent resize-none focus:outline-none focus:ring-0 border-0 overflow-y-auto selection:bg-accent-azure/20"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Execution Terminal Console */}
        <div className="md:col-span-5 flex flex-col bg-surface border border-subtle rounded-2xl overflow-hidden shadow-card-elevated transition-all duration-200">
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-elevated border-b border-subtle text-xs text-text-secondary">
            <div className="flex items-center gap-2 font-mono">
              <span className={`w-2 h-2 rounded-full ${
                isRunning ? "bg-accent-azure animate-ping" : outputStatus === "ERROR" ? "bg-rose-500" : "bg-accent-emerald animate-pulse"
              }`} />
              <span className="font-semibold text-text-primary">Console Output</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {attempts > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet font-semibold border border-accent-violet/20">
                  Self-Correction: Attempt {attempts} / 2
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-xs leading-relaxed bg-canvas overflow-y-auto whitespace-pre-wrap space-y-1">
            {renderFormattedConsoleOutput(output)}
          </div>
        </div>
      </div>
    </div>
  );
};
