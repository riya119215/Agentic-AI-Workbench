import React, { useState, useEffect } from "react";
import { TopBar, PrimaryRoute } from "./components/TopBar";
import { WorkspaceHub } from "./components/WorkspaceHub";
import { WorkspaceView } from "./components/WorkspaceView";
import { CommandPalette } from "./components/CommandPalette";
import { AgentStudio } from "./components/AgentStudio";
import { KnowledgeHub } from "./components/KnowledgeHub";
import { ModelControlCenter } from "./components/ModelControlCenter";
import { VisionWorkspace } from "./components/VisionWorkspace";
import { WorkflowBuilder } from "./components/WorkflowBuilder";
import { DeliverablesWorkspace } from "./components/DeliverablesWorkspace";
import { SecurityCenter } from "./components/SecurityCenter";
import { SystemMonitor } from "./components/SystemMonitor";
import { api, UserProfile } from "./lib/api";

export function App() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRoute, setActiveRoute] = useState<PrimaryRoute>("workspace");
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [scenarioPrompt, setScenarioPrompt] = useState<string>("");
  const [scenarioAttachments, setScenarioAttachments] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const uList = await api.getUsers();
        setUsers(uList);
        if (uList.length > 0) {
          setCurrentUser(uList[0]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, []);

  const handleOpenWorkspace = (workspaceId: string, name: string) => {
    setSelectedWorkspace({ id: workspaceId, name });
    setActiveRoute("workspace");
  };

  const handleExecuteScenario = (
    scenarioId: string,
    prompt: string,
    attachments: string[]
  ) => {
    const scenarioNames: Record<string, string> = {
      "demo-1": "Turbine Unit 7 Overhaul",
      "demo-2": "Railway Axle Telemetry Analysis",
      "demo-3": "Executive Defect & Telemetry Package"
    };
    setSelectedWorkspace({
      id: scenarioId,
      name: scenarioNames[scenarioId] || "Operational Scenario"
    });
    setScenarioPrompt(prompt);
    setScenarioAttachments(attachments);
    setActiveRoute("workspace");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#171717] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <TopBar
        activeRoute={activeRoute}
        onSelectRoute={(route) => {
          setActiveRoute(route);
          if (route === "workspace" && !selectedWorkspace) {
            setSelectedWorkspace(null);
          }
        }}
        currentUser={currentUser}
        users={users}
        onSelectUser={setCurrentUser}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Global Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectRoute={(route) => setActiveRoute(route)}
        onOpenWorkspace={handleOpenWorkspace}
        onExecuteScenario={handleExecuteScenario}
      />

      {/* Main Operational Container */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* WORKSPACE ROUTE */}
        {activeRoute === "workspace" && (
          <>
            {selectedWorkspace ? (
              <WorkspaceView
                workspaceId={selectedWorkspace.id}
                workspaceName={selectedWorkspace.name}
                currentUser={currentUser}
                initialPrompt={scenarioPrompt}
                initialAttachments={scenarioAttachments}
                onBackToHub={() => {
                  setSelectedWorkspace(null);
                  setScenarioPrompt("");
                  setScenarioAttachments([]);
                }}
              />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <WorkspaceHub
                  currentUser={currentUser}
                  onOpenWorkspace={handleOpenWorkspace}
                  onExecuteScenario={handleExecuteScenario}
                  onSelectRoute={setActiveRoute}
                />
              </div>
            )}
          </>
        )}

        {/* AGENTS ROUTE */}
        {activeRoute === "agents" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <AgentStudio
              currentUser={currentUser}
              initialPrompt={scenarioPrompt}
              initialAttachments={scenarioAttachments}
              onClearInitialDemo={() => {
                setScenarioPrompt("");
                setScenarioAttachments([]);
              }}
            />
          </div>
        )}

        {/* KNOWLEDGE ROUTE */}
        {activeRoute === "knowledge" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <KnowledgeHub
              currentUser={currentUser}
              onSelectQuery={(prompt, attachments) =>
                handleExecuteScenario("demo-1", prompt, attachments)
              }
            />
          </div>
        )}

        {/* MODELS ROUTE */}
        {activeRoute === "models" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <ModelControlCenter />
          </div>
        )}

        {/* VISION ROUTE */}
        {activeRoute === "vision" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <VisionWorkspace
              onNavigateToAgent={(prompt, attachments) =>
                handleExecuteScenario("demo-1", prompt, attachments)
              }
            />
          </div>
        )}

        {/* WORKFLOWS ROUTE */}
        {activeRoute === "workflows" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <WorkflowBuilder
              onNavigateToAgent={(prompt, attachments) =>
                handleExecuteScenario("demo-1", prompt, attachments)
              }
            />
          </div>
        )}

        {/* DELIVERABLES ROUTE */}
        {activeRoute === "deliverables" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <DeliverablesWorkspace />
          </div>
        )}

        {/* SECURITY ROUTE */}
        {activeRoute === "security" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <SecurityCenter />
          </div>
        )}

        {/* SYSTEM TELEMETRY ROUTE */}
        {activeRoute === "system" && (
          <div className="p-4 flex-1 overflow-auto">
            <button
              onClick={() => setActiveRoute("workspace")}
              className="mb-4 text-xs font-semibold text-[#171717] hover:underline flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
            <SystemMonitor />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
