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

export const api = {
  async executeAgent(prompt: string, userId: string, attachments: string[] = []): Promise<AgentResponse> {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, user_id: userId, attachments }),
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

  async verifyAuditChain(): Promise<{ is_valid: boolean; total_records: number; message: string }> {
    const res = await fetch(`${API_BASE}/api/audit/verify`);
    return res.json();
  },

  async getEgressStatus(): Promise<EgressStatus> {
    const res = await fetch(`${API_BASE}/api/egress/status`);
    return res.json();
  },

  getDeliverableUrl(filename: string): string {
    return `${API_BASE}/deliverables/${filename}`;
  }
};
