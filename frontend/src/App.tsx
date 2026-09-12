import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AgentChat } from "./components/AgentChat";
import { KnowledgeBaseHub } from "./components/KnowledgeBaseHub";
import { AuditLogViewer } from "./components/AuditLogViewer";
import { ZeroEgressMonitor } from "./components/ZeroEgressMonitor";
import { api, UserProfile } from "./lib/api";

export function App() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "kb" | "audit" | "egress">("chat");
  const [isAirGapped, setIsAirGapped] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const uList = await api.getUsers();
        setUsers(uList);
        if (uList.length > 0) {
          setCurrentUser(uList[0]);
        }
        const egress = await api.getEgressStatus();
        setIsAirGapped(egress.is_air_gapped);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060D1A] text-slate-100">
      <Navbar
        currentUser={currentUser}
        users={users}
        onSelectUser={setCurrentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAirGapped={isAirGapped}
      />

      <main className="flex-1">
        {activeTab === "chat" && <AgentChat currentUser={currentUser} />}
        {activeTab === "kb" && <KnowledgeBaseHub currentUser={currentUser} />}
        {activeTab === "audit" && <AuditLogViewer />}
        {activeTab === "egress" && <ZeroEgressMonitor />}
      </main>
    </div>
  );
}

export default App;
