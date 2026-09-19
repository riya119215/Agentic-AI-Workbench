import { Artifact, Citation, VerificationFinding } from "./api";
import { ChatMessageItem } from "./types";

export type { ChatMessageItem };

export interface TaskSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  prompt: string;
  attachments: string[];
  messages: ChatMessageItem[];
  findings?: VerificationFinding[];
  citations?: Citation[];
  deliverables?: Artifact[];
  approvalStatus?: "pending" | "approved";
}

const STORAGE_KEY = "sov_task_sessions";

export const taskStorage = {
  getSessions(): TaskSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Sort newest first
      return parsed.sort(
        (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );
    } catch (e) {
      console.warn("Failed to load task sessions from storage:", e);
      return [];
    }
  },

  getSession(id: string): TaskSession | null {
    const sessions = this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  saveSession(session: TaskSession): void {
    try {
      const sessions = this.getSessions();
      const idx = sessions.findIndex((s) => s.id === session.id);
      const updatedSession: TaskSession = {
        ...session,
        updatedAt: new Date().toISOString(),
      };

      if (idx >= 0) {
        sessions[idx] = updatedSession;
      } else {
        sessions.unshift(updatedSession);
      }

      // Limit to last 50 sessions
      const trimmed = sessions.slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn("Failed to save task session to storage:", e);
    }
  },

  deleteSession(id: string): void {
    try {
      const sessions = this.getSessions().filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn("Failed to delete task session:", e);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear sessions:", e);
    }
  },
};
