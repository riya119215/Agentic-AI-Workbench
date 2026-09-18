const API_BASE = "http://127.0.0.1:8000";

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
}

export interface Artifact {
  filename: string;
  type: string;
  label: string;
  size_bytes: number;
}

export interface Citation {
  source: string;
  section?: string;
  page?: number;
  clause?: string;
}

export interface AgentResponse {
  response: string;
  steps: AgentStep[];
  artifacts: Artifact[];
  citations: Citation[];
  model_routing: {
    selected_model: string;
    task_type: string;
    rationale: string;
    backend: string;
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

export const api = {
  async executeAgent(prompt: string, userId: string, attachments: string[] = [], clearance: string = "RESTRICTED"): Promise<AgentResponse> {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, user_id: userId, attachments, clearance }),
    });
    if (!res.ok) throw new Error(`Agent error: ${res.statusText}`);
    return res.json();
  },

  async getUsers(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/api/security/users`);
    return res.json();
  },

  async getIndexedDocs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/docs/list`);
    return res.json();
  },

  async uploadDocument(file: File, department: string, classification: string, userId: string): Promise<any> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("department", department);
    fd.append("classification", classification);
    fd.append("user_id", userId);

    const res = await fetch(`${API_BASE}/api/docs/upload`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLogRecord[]> {
    const res = await fetch(`${API_BASE}/api/audit/logs`);
    return res.json();
  },

  async verifyAuditChain(): Promise<{ is_valid: boolean; total_records: number; message: string; latest_block_hash?: string }> {
    const res = await fetch(`${API_BASE}/api/audit/verify`);
    return res.json();
  },

  async getEgressStatus(): Promise<EgressStatus> {
    const res = await fetch(`${API_BASE}/api/egress/status`);
    return res.json();
  },

  async getModelStatus(): Promise<ModelRuntimeStatus> {
    const res = await fetch(`${API_BASE}/api/models/status`);
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
  }
};


