import React, { useState } from "react";
import { Copy, Check, Play, Terminal } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
  onRunInSandbox?: (code: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = "python",
  code,
  onRunInSandbox,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-3.5 rounded-xl overflow-hidden border border-subtle bg-surface-elevated text-xs font-mono shadow-2xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-surface border-b border-subtle text-text-secondary select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-accent-azure" />
          <span className="text-[11px] font-semibold text-text-primary uppercase">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRunInSandbox && (
            <button
              onClick={() => onRunInSandbox(code)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-[11px] font-medium transition cursor-pointer"
              title="Run script in isolated Python sandbox"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run in Sandbox</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition cursor-pointer text-[11px]"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-emerald" />
                <span className="text-accent-emerald">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Text Area */}
      <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed text-text-primary bg-canvas/60">
        <code>{code}</code>
      </pre>
    </div>
  );
};
