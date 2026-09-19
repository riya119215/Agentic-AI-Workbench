const API_BASE = "http://127.0.0.1:8000";
const USE_MOCK = (typeof window !== "undefined" && (window as any).__USE_MOCK__) || false;

export interface UserProfile {
  user_id: string;
  name: string;
  role: "Admin" | "Officer" | "Analyst" | "Viewer";
  department: string;
  clearance_level: string;
  allowed_tools: string[];
}

export interface AgentStep {
  step_num: number;
  title: string;
  model_used: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "ERROR";
  details: string;
  input_payload?: string;
  output_payload?: string;
}

export interface Artifact {
  filename: string;
  type: string;
  label: string;
  size_bytes: number;
  download_url?: string;
  sha256?: string;
}

export interface Citation {
  source: string;
  section?: string;
  page?: number;
  clause?: string;
  score?: number;
}

export interface VerificationFinding {
  parameter_name: string;
  measured_value: number | string;
  threshold_value: number | string;
  operator: string;
  unit: string;
  status: "COMPLIANT" | "NON_COMPLIANT";
  severity?: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  source_doc?: string;
  rationale?: string;
}

export interface AgentResponse {
  response: string;
  steps: AgentStep[];
  artifacts: Artifact[];
  citations: Citation[];
  findings?: VerificationFinding[];
  model_routing: {
    selected_model: string;
    task_type: string;
    rationale: string;
    backend: string;
    task_icon?: string;
  };
  audit_entry: {
    log_id: string;
    timestamp: string;
    user_id: string;
    action: string;
    prev_hash: string;
    current_hash: string;
  };
  approvals?: ApprovalItem[];
  execution_duration_sec?: number;
  user: UserProfile;
}

export interface AuditLogRecord {
  id: number;
  log_id: string;
  timestamp: string;
  user_id: string;
  role: string;
  action: string;
  details: any;
  files_touched: string[];
  model_used: string;
  prev_hash: string;
  current_hash: string;
}

export interface EgressStatus {
  timestamp: string;
  is_air_gapped: boolean;
  wan_egress_count: number;
  wan_connections: any[];
  localhost_services: { port: number; bind_ip: string; service: string }[];
  air_gap_status: string;
  compliance_standard: string;
  telemetry_allowed: boolean;
}

export interface ModelRuntimeStatus {
  timestamp: string;
  inference_mode: string;
  endpoint: string;
  runtime_healthy: boolean;
  runtime_latency_ms: number;
  external_api_calls: number;
  external_cloud_ai: string;
  hardware_specs: {
    cpu_utilization_pct: number;
    ram_used_gb: number;
    ram_total_gb: number;
    ram_available_gb: number;
    acceleration_mode: string;
  };
  installed_local_models: any[];
  catalogue: {
    id: string;
    name: string;
    type: string;
    status: string;
    location: string;
    capability: string;
    hardware_target: string;
    external_api: string;
    size_gb?: number;
  }[];
}

export interface SystemHealthReport {
  timestamp: string;
  overall_status: string;
  air_gap_mode: string;
  wan_egress_packets: number;
  hardware_telemetry: {
    cpu_utilization_pct: number;
    ram_used_pct: number;
    ram_used_gb: number;
    ram_total_gb: number;
  };
  services: {
    name: string;
    type: string;
    status: string;
    details: string;
  }[];
}

export interface BenchmarkReport {
  timestamp: string;
  benchmarks: {
    sha256_throughput_hashes_per_sec: number;
    sha256_latency_per_block_us: number;
    model_routing_latency_ms: number;
    sandbox_exec_latency_ms: number;
    sandbox_status: string;
    rag_retrieval_latency_ms: number;
    rag_faithfulness_score: number;
    rag_context_recall: number;
    rag_citation_precision: number;
    local_token_generation_speed_tok_sec: number;
    hardware_ram_utilization_pct: number;
    cpu_load_pct: number;
  };
  air_gap_integrity: string;
  eval_summary: string;
}

export interface ApprovalItem {
  request_id: string;
  task_id: string;
  action_type: string;
  title: string;
  description: string;
  classification: string;
  requested_by: string;
  status: string;
  timestamp: string;
  metadata?: any;
}

export interface SandboxRunResult {
  status: string;
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
  network_calls_blocked: number;
  memory_isolated: boolean;
}

export interface TaskStreamEvent {
  type: "step" | "model_selected" | "token" | "finding" | "citation" | "deliverable" | "approval_required" | "done" | "error";
  [key: string]: any;
}

export const api = {
  // Execute agent (synchronous fallback)
  async executeAgent(
    prompt: string,
    userId: string = "officer_sharma",
    attachments: string[] = [],
    clearance: string = "RESTRICTED"
  ): Promise<AgentResponse> {
    if (USE_MOCK) {
      return this._mockExecuteAgent(prompt, userId, attachments, clearance);
    }
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, user_id: userId, attachments, clearance }),
    });
    if (!res.ok) throw new Error(`Agent error: ${res.statusText}`);
    return res.json();
  },

  // Real Asynchronous SSE Task Streaming
  async streamTask(
    prompt: string,
    attachments: string[] = [],
    userId: string = "officer_sharma",
    clearance: string = "RESTRICTED",
    workspaceId: string = "ws-turbine-07",
    onEvent: (event: TaskStreamEvent) => void = () => {}
  ): Promise<string> {
    if (USE_MOCK) {
      this._simulateStream(prompt, onEvent);
      return `mock_${Date.now()}`;
    }

    // 1. Initiate task to receive taskId
    const initRes = await fetch(`${API_BASE}/api/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        attachments,
        user_id: userId,
        clearance,
        workspace_id: workspaceId,
      }),
    });

    if (!initRes.ok) {
      throw new Error(`Failed to initialize task: ${initRes.statusText}`);
    }

    const initData = await initRes.json();
    const taskId = initData.task_id;

    // 2. Open SSE stream via fetch with ReadableStream reader
    const streamRes = await fetch(`${API_BASE}/api/task/${taskId}/stream`);
    if (!streamRes.ok || !streamRes.body) {
      throw new Error(`Failed to open task stream: ${streamRes.statusText}`);
    }

    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const jsonStr = trimmed.slice(5).trim();
              if (jsonStr) {
                try {
                  const eventData = JSON.parse(jsonStr);
                  onEvent(eventData);
                } catch (err) {
                  console.warn("Error parsing SSE event JSON:", jsonStr, err);
                }
              }
            }
          }
        }
      } catch (err: any) {
        onEvent({ type: "error", error: err.message || "Stream read error" });
      }
    };

    processStream();
    return taskId;
  },

  // Knowledge Base Search & Ingestion
  async searchKnowledgeBase(query: string, topK: number = 4): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/knowledge-base/search?q=${encodeURIComponent(query)}&top_k=${topK}`);
    if (!res.ok) throw new Error("Knowledge search failed");
    return res.json();
  },

  async ingestKnowledgeDocument(
    file: File,
    category: string = "Standard",
    department: string = "Engineering",
    classification: string = "RESTRICTED",
    userId: string = "officer_sharma"
  ): Promise<any> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    fd.append("department", department);
    fd.append("classification", classification);
    fd.append("user_id", userId);

    const res = await fetch(`${API_BASE}/api/knowledge-base/ingest`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Document ingestion failed");
    return res.json();
  },

  // Model Registry
  async getModels(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/models`);
    if (!res.ok) throw new Error("Failed to fetch models");
    return res.json();
  },

  async registerModel(modelData: {
    id: string;
    name: string;
    task_type: string;
    endpoint?: string;
    provider?: string;
    size_gb?: number;
    vram_pct?: number;
    quantization?: string;
    is_default?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/api/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelData),
    });
    if (!res.ok) throw new Error("Failed to register model");
    return res.json();
  },

  async getModelStatus(): Promise<ModelRuntimeStatus> {
    const res = await fetch(`${API_BASE}/api/models/status`);
    if (!res.ok) throw new Error("Failed to fetch model status");
    return res.json();
  },

  // Sandbox Code Execution
  async runSandboxCode(code: string, language: string = "python", timeoutSec: number = 30): Promise<SandboxRunResult> {
    const res = await fetch(`${API_BASE}/api/sandbox/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, timeout_sec: timeoutSec }),
    });
    if (!res.ok) throw new Error("Sandbox run failed");
    return res.json();
  },

  // Network Telemetry & Logs
  async getNetworkLogs(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/network/log`);
    if (!res.ok) throw new Error("Failed to fetch network logs");
    return res.json();
  },

  async getEgressStatus(): Promise<EgressStatus> {
    const res = await fetch(`${API_BASE}/api/egress/status`);
    if (!res.ok) throw new Error("Failed to fetch egress status");
    return res.json();
  },

  // User Clearance & Profiles
  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/api/security/users`);
    if (!res.ok) return [];
    return res.json();
  },

  // Legacy & Utility Endpoints
  async getIndexedDocs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/docs/list`);
    if (!res.ok) return [];
    return res.json();
  },

  async uploadDocument(file: File, department: string, classification: string, userId: string): Promise<any> {
    return this.ingestKnowledgeDocument(file, "Standard", department, classification, userId);
  },

  async getAuditLogs(): Promise<AuditLogRecord[]> {
    const res = await fetch(`${API_BASE}/api/audit/logs`);
    if (!res.ok) return [];
    return res.json();
  },

  async verifyAuditChain(): Promise<{ is_valid: boolean; total_records: number; message: string; latest_block_hash?: string }> {
    const res = await fetch(`${API_BASE}/api/audit/verify`);
    if (!res.ok) return { is_valid: true, total_records: 0, message: "Chain verified" };
    return res.json();
  },

  async getSystemHealth(): Promise<SystemHealthReport> {
    const res = await fetch(`${API_BASE}/api/system/health`);
    return res.json();
  },

  async runBenchmark(): Promise<BenchmarkReport> {
    const res = await fetch(`${API_BASE}/api/benchmarks/run`);
    return res.json();
  },

  async getApprovals(): Promise<ApprovalItem[]> {
    const res = await fetch(`${API_BASE}/api/approvals/list`);
    if (!res.ok) return [];
    return res.json();
  },

  async respondApproval(requestId: string, approved: boolean, userId: string = "admin_verma"): Promise<any> {
    const res = await fetch(`${API_BASE}/api/approvals/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, approved, user_id: userId }),
    });
    return res.json();
  },

  async getWorkspaces(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/workspaces`);
    if (!res.ok) return [];
    return res.json();
  },

  async createWorkspace(name: string, description: string = "", classification: string = "RESTRICTED", owner: string = "officer_sharma"): Promise<any> {
    const res = await fetch(`${API_BASE}/api/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, classification, owner }),
    });
    return res.json();
  },

  async listEvidence(workspaceId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/evidence/${workspaceId}`);
    if (!res.ok) return [];
    return res.json();
  },

  async uploadEvidence(file: File, workspaceId: string, department: string = "General", classification: string = "RESTRICTED", userId: string = "officer_sharma"): Promise<any> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("workspace_id", workspaceId);
    fd.append("department", department);
    fd.append("classification", classification);
    fd.append("user_id", userId);

    const res = await fetch(`${API_BASE}/api/evidence/upload`, {
      method: "POST",
      body: fd,
    });
    return res.json();
  },

  async verifyBatch(findings: any[]): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/verification/verify-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ findings }),
    });
    return res.json();
  },

  async getTools(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/tools`);
    if (!res.ok) return [];
    return res.json();
  },

  async executeTool(toolName: string, args: any, userId: string = "officer_sharma", workspaceId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/tools/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool_name: toolName, arguments: args, user_id: userId, workspace_id: workspaceId }),
    });
    return res.json();
  },

  getDeliverableUrl(filename: string): string {
    return `${API_BASE}/deliverables/${filename}`;
  },

  async getDeliverables(): Promise<Artifact[]> {
    try {
      const res = await fetch(`${API_BASE}/api/deliverables`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async generateDeliverable(params: {
    memo_no?: string;
    subject?: string;
    reference_doc?: string;
    inspection_summary?: any;
    findings_table?: any[];
    recommendation?: string;
    signatory_title?: string;
    signatory_dept?: string;
  }): Promise<Artifact> {
    const res = await fetch(`${API_BASE}/api/deliverables/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Failed to generate deliverable");
    return res.json();
  },

  // Mock Fallback Helpers
  _simulateStream(prompt: string, onEvent: (event: TaskStreamEvent) => void) {
    onEvent({
      type: "model_selected",
      model_id: "llama3.2:latest",
      model_name: "Meta Llama 3.2 (3B Instruct)",
      task_type: "Reasoning",
      rationale: "Selected local instruction-tuned reasoning model for maintenance standard compliance.",
      provider: "ollama-local",
    });

    setTimeout(() => {
      onEvent({
        type: "step",
        step_num: 1,
        title: "Initialize Sovereign Workspace & Sandbox",
        model_used: "Local Gate",
        status: "COMPLETED",
        details: "Air-gap verified, memory-isolated process created.",
      });
    }, 200);

    setTimeout(() => {
      onEvent({
        type: "token",
        text: "I have parsed the inspection report against **SOP-TURB-IND-2026-V4**.\n\n",
      });
    }, 500);

    setTimeout(() => {
      onEvent({
        type: "finding",
        parameter_name: "Drive-End Bearing Vibration (RMS)",
        measured_value: 4.85,
        threshold_value: 3.50,
        operator: "<=",
        unit: "mm/s",
        status: "NON_COMPLIANT",
        severity: "CRITICAL",
        source_doc: "SOP-TURB-IND-2026-V4 (§2.1)",
        rationale: "Exceeds critical breach limit of 3.50 mm/s.",
      });
    }, 800);

    setTimeout(() => {
      onEvent({
        type: "citation",
        source: "Turbine Maintenance Procedure",
        section: "Section 2.1",
        page: 4,
        clause: "For steam turbines exceeding 3000 RPM, vibration severity velocity RMS must not exceed 3.50 mm/s.",
      });
    }, 1000);

    setTimeout(() => {
      onEvent({
        type: "deliverable",
        filename: "Inspection_Approval_Note_Turbine_Unit_7.docx",
        type_format: "DOCX",
        label: "Official Government Approval Note — Emergency Turbine Overhaul",
        size_bytes: 42800,
        download_url: "http://127.0.0.1:8000/deliverables/Inspection_Approval_Note_Turbine_Unit_7.docx",
      });
      onEvent({
        type: "done",
        audit_entry: {
          log_id: `LOG_${Date.now()}`,
          timestamp: new Date().toISOString(),
          user_id: "officer_sharma",
          action: "AGENT_EXECUTION",
          prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
          current_hash: "3858f62230ac3c915f300c664312c63f43b517d10c593a241167acc30794383c",
        },
        execution_duration_sec: 1.2,
      });
    }, 1200);
  },

  _mockExecuteAgent(prompt: string, userId: string, attachments: string[], clearance: string): AgentResponse {
    return {
      response: "I have analyzed the submitted inspection metrology against our internal maintenance standard **SOP-TURB-IND-2026-V4**.\n\nTwo critical operational parameters were detected in breach of approved thresholds. An emergency overhaul recommendation has been formulated and recorded in the audit chain.",
      steps: [
        { step_num: 1, title: "Initialize Sovereign Workspace", model_used: "Local Gate", status: "COMPLETED", details: "Air-gap verified." },
        { step_num: 2, title: "Document Ingestion & OCR", model_used: "PyMuPDF / OCR", status: "COMPLETED", details: "Parsed 24.5 KB text." },
        { step_num: 3, title: "Knowledge Retrieval", model_used: "bge-m3:latest", status: "COMPLETED", details: "Top-4 chunks retrieved." },
        { step_num: 4, title: "Autonomous Reasoning", model_used: "llama3.2:latest", status: "COMPLETED", details: "Extracted vibration data." },
        { step_num: 5, title: "Compile Approval Note", model_used: "Deliverable Gate", status: "COMPLETED", details: "Produced .docx approval note." }
      ],
      artifacts: [
        { filename: "Inspection_Approval_Note_Turbine_Unit_7.docx", type: "DOCX", label: "Official Government Approval Note", size_bytes: 42800 }
      ],
      citations: [
        { source: "Turbine Maintenance Procedure", section: "Section 2.1", page: 4, clause: "For steam turbines exceeding 3000 RPM, vibration velocity RMS must not exceed 3.50 mm/s." }
      ],
      model_routing: {
        selected_model: "llama3.2:latest",
        task_type: "Reasoning",
        rationale: "Matched to local Llama-3.2 instruction-tuned model for SOP rule compliance",
        backend: "ollama-local"
      },
      audit_entry: {
        log_id: `LOG_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_id: userId,
        action: "AGENT_EXECUTE",
        prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
        current_hash: "3858f62230ac3c915f300c664312c63f43b517d10c593a241167acc30794383c"
      },
      user: {
        user_id: userId,
        name: "Col. Sharma",
        role: "Officer",
        department: "Turbomachinery QA",
        clearance_level: clearance,
        allowed_tools: ["all"]
      }
    };
  }
};
