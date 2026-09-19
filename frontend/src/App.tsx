import React, { useState, useEffect } from "react";
import { TopNav } from "./components/layout/TopNav";
import { LandingView } from "./components/views/LandingView";
import { TaskWorkspaceView } from "./components/views/TaskWorkspaceView";
import { KnowledgeBaseView } from "./components/views/KnowledgeBaseView";
import { DeliverablesView } from "./components/views/DeliverablesView";
import { DocumentPreviewModal } from "./components/modals/DocumentPreviewModal";
import { SourceInspectionDrawer } from "./components/modals/SourceInspectionDrawer";
import { VerificationInspectionDrawer, VerificationFinding } from "./components/modals/VerificationInspectionDrawer";
import { NetworkDetailsModal } from "./components/modals/NetworkDetailsModal";
import { api, UserProfile, Artifact, Citation } from "./lib/api";
import { PrimaryView } from "./lib/types";
import { TaskSession } from "./lib/taskStorage";

export function App() {
  const [activeView, setActiveView] = useState<PrimaryView>("workspace");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Active Task Inputs
  const [taskPrompt, setTaskPrompt] = useState<string>("");
  const [taskAttachments, setTaskAttachments] = useState<string[]>([]);
  const [sandboxCode, setSandboxCode] = useState<string | undefined>(undefined);

  // Modals & Drawers State
  const [previewArtifact, setPreviewArtifact] = useState<Artifact | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationFindings, setVerificationFindings] = useState<VerificationFinding[] | undefined>(undefined);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  // Guarantee light mode class on root
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
    localStorage.removeItem("sov_theme");
  }, []);

  // Load user clearance profile on mount
  useEffect(() => {
    const init = async () => {
      try {
        const uList = await api.getUsers();
        setUsers(uList);
        if (uList.length > 0) {
          setCurrentUser(uList[0]);
        }
      } catch (err) {
        setCurrentUser({
          user_id: "officer_sharma",
          name: "Col. Sharma",
          role: "Officer",
          department: "Turbomachinery QA",
          clearance_level: "SECRET",
          allowed_tools: ["all"]
        });
      }
    };
    init();
  }, []);

  // Handle prompt submission from landing screen
  const handleSubmitTask = (prompt: string, attachments: string[] = [], mode: string = "Balanced") => {
    const newId = `task_${Date.now()}`;
    setTaskPrompt(prompt);
    setTaskAttachments(attachments);
    setActiveTaskId(newId);
    setActiveView("workspace");
  };

  const handleSelectSavedSession = (session: TaskSession) => {
    setActiveTaskId(session.id);
    setTaskPrompt(session.prompt || "");
    setTaskAttachments(session.attachments || []);
    setActiveView("workspace");
  };

  const handleNewTask = () => {
    const newId = `task_${Date.now()}`;
    setActiveTaskId(newId);
    setTaskPrompt("");
    setTaskAttachments([]);
    setActiveView("workspace");
  };

  // Handle Quick Action card clicks
  const handleQuickAction = (actionType: "document" | "code" | "drawing" | "note") => {
    if (actionType === "document") {
      handleSubmitTask(
        "Analyze this scanned inspection report for Unit 7 Turbine against SOP-TURB-IND-2026-V4.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    } else if (actionType === "code") {
      handleSubmitTask(
        "Verify vibration and temperature limits for Unit 7 against approved SOP limits.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    } else if (actionType === "drawing") {
      handleSubmitTask(
        "Summarize this inspection report and maintenance procedure into an executive brief.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    } else if (actionType === "note") {
      handleSubmitTask(
        "Generate official Government Approval Note Sheet (.docx) for emergency overhaul of Unit 7 Turbine.",
        ["INSPECTION_REPORT_TURBINE_UNIT_7.txt"]
      );
    }
  };

  return (
    <div className="h-full max-h-screen flex flex-col bg-[#F7F6F2] text-[#171717] font-sans antialiased selection:bg-[#E8F7F1] selection:text-[#00A878] overflow-hidden">
      {/* Clean 48px Top Header Navigation */}
      <TopNav
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          if (view === "workspace" && !activeTaskId) {
            setActiveTaskId(null);
          }
        }}
        currentUser={currentUser}
        users={users}
        onSelectUser={setCurrentUser}
        onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-h-0">
        {/* WORKSPACE VIEW: Landing vs Active Clean Workspace */}
        {activeView === "workspace" && (
          <>
            {activeTaskId ? (
              <TaskWorkspaceView
                key={activeTaskId}
                taskId={activeTaskId}
                currentUser={currentUser}
                onBackToHome={() => {
                  setActiveTaskId(null);
                  setTaskPrompt("");
                  setTaskAttachments([]);
                }}
                onNewTask={handleNewTask}
                onOpenSandbox={() => {}}
                onOpenCitation={(cit) => setSelectedCitation(cit)}
                onPreviewDeliverable={(art) => setPreviewArtifact(art)}
                onOpenVerification={(findings) => {
                  setVerificationFindings(findings);
                  setIsVerificationOpen(true);
                }}
                initialPrompt={taskPrompt}
                initialAttachments={taskAttachments}
              />
            ) : (
              <LandingView
                onSubmitPrompt={handleSubmitTask}
                onQuickAction={handleQuickAction}
                onSelectSavedSession={handleSelectSavedSession}
              />
            )}
          </>
        )}

        {/* KNOWLEDGE BASE VIEW */}
        {activeView === "knowledge" && (
          <KnowledgeBaseView
            onOpenCitation={(cit) => setSelectedCitation(cit)}
          />
        )}

        {/* DELIVERABLES VIEW */}
        {activeView === "deliverables" && (
          <DeliverablesView
            onPreviewDeliverable={(art) => setPreviewArtifact(art)}
          />
        )}
      </main>

      {/* Slide-Over Drawers & Modal Overlays */}
      <SourceInspectionDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      <VerificationInspectionDrawer
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        findings={verificationFindings}
        onGenerateReport={() => {
          handleSubmitTask("Generate official Government Approval Note Sheet (.docx) for emergency overhaul.");
          setIsVerificationOpen(false);
        }}
      />

      <DocumentPreviewModal
        artifact={previewArtifact}
        onClose={() => setPreviewArtifact(null)}
      />

      <NetworkDetailsModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />
    </div>
  );
}

export default App;
