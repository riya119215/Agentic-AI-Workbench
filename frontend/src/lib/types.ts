import { UserProfile, Artifact, Citation, ApprovalItem } from './api';

export type PrimaryView = 'workspace' | 'knowledge' | 'deliverables' | 'admin' | 'sandbox' | 'models';

export interface ModelRoutingInfo {
  selected_model: string;
  task_type: string;
  task_icon: string;
  rationale: string;
  backend: string;
}

export interface AgentFlowNode {
  id: string;
  label: string;
  type: 'agent' | 'router' | 'tool' | 'output' | 'deliverable';
  status: 'pending' | 'active' | 'completed' | 'error';
  detail?: string;
}

export interface VerificationFinding {
  parameter_name: string;
  measured_value: number | string;
  threshold_value: number | string;
  operator: string;
  unit: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT';
  severity?: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  source_doc?: string;
  rationale?: string;
}

export interface ExecutionStep {
  step_num: number;
  title: string;
  model_used: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  details: string;
  input_payload?: string;
  output_payload?: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: string[];
  model_routing?: ModelRoutingInfo;
  findings?: VerificationFinding[];
  citations?: Citation[];
  artifacts?: Artifact[];
  approvals?: ApprovalItem[];
  steps?: ExecutionStep[];
  isStreaming?: boolean;
}
