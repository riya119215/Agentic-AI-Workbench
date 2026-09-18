import React, { useState, useEffect } from "react";
import {
  Search,
  UploadCloud,
  FileCheck,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Bookmark
} from "lucide-react";
import { api, UserProfile } from "../lib/api";

interface KnowledgeHubProps {
  currentUser: UserProfile | null;
  onSelectQuery?: (prompt: string, attachments: string[]) => void;
}

export const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ currentUser, onSelectQuery }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [department, setDepartment] = useState("Turbomachinery QA");
  const [classification, setClassification] = useState("RESTRICTED");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const collections = [
    { title: "Turbomachinery SOPs", count: "SOP-TURB-IND-2026-V4", desc: "Emergency overhaul and vibration limit procedures" },
    { title: "Railway Safety Manuals", count: "IRS-MECH-2025", desc: "Axle temperature thresholds and sensor inspection limits" },
    { title: "Defence Engineering Standards", count: "DEF-STD-05-21", desc: "Journal bearing cavitation and babbit surface criteria" }
  ];

  const loadDocs = async () => {
    try {
      const data = await api.getIndexedDocs();
      setDocs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadMessage("");
    try {
      await api.uploadDocument(
        selectedFile,
        department,
        classification,
        currentUser?.user_id || "officer_sharma"
      );
      setUploadMessage(`Successfully indexed ${selectedFile.name}`);
      setSelectedFile(null);
      await loadDocs();
    } catch (err: any) {
      setUploadMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSearchKnowledge = (queryText?: string) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setSearchResults([
        {
          source: "SOP-TURB-IND-2026-V4.txt",
          department: "Turbomachinery QA",
          page: 14,
          section: "Clause 7.2.1 - Permissible Radial Vibration Limits",
          snippet: "Radial vibration RMS velocity shall not exceed 4.5 mm/s under steady-state operating RPM. Any continuous excursion above 7.1 mm/s mandates immediate trip and emergency overhaul classification.",
          relevance: "98.7% match"
        },
        {
          source: "SOP-TURB-IND-2026-V4.txt",
          department: "Turbomachinery QA",
          page: 18,
          section: "Clause 8.4 - Temperature Gradient Overheat Protocol",
          snippet: "Thrust bearing pad temperatures exceeding 95°C trigger Stage 1 warning. Temperatures surpassing 110°C require manual approval note generation for statutory overhaul within 48 hours.",
          relevance: "94.2% match"
        },
        {
          source: "DEF-STD-05-21-CAVITATION.pdf",
          department: "Defence Inspection Wing",
          page: 32,
          section: "Clause 3.1 - Journal Bearing Micro-Pitting Acceptance",
          snippet: "Cavitation pitting exceeding 0.8mm depth on babbit surface is strictly non-conformant for naval propulsion turbines.",
          relevance: "89.5% match"
        }
      ]);
      setIsSearching(false);
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-sovBorder">
        <div>
          <h1 className="text-xl font-semibold text-sovGraphite-950">
            Knowledge
          </h1>
          <p className="text-xs text-sovGraphite-500 mt-0.5">
            Search on-premise vector embeddings and regulatory manuals.
          </p>
        </div>

        <button
          onClick={loadDocs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-sovWarm-100 border border-sovBorder text-xs text-sovGraphite-700 font-medium transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Prominent Search-First Box */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchKnowledge();
          }}
          className="relative"
        >
          <Search className="w-4 h-4 text-sovGraphite-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask your local knowledge (e.g., 'What are vibration tolerance limits?')..."
            className="w-full text-xs sm:text-sm bg-white border border-sovBorder rounded-xl pl-10 pr-24 py-3 text-sovGraphite-900 placeholder-sovGraphite-400 focus:outline-none focus:border-sovGraphite-400 shadow-2xs font-sans"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-2 px-3 py-1.5 rounded-lg bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white text-xs font-medium transition disabled:opacity-30"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Quick Sample Query Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-sovGraphite-400">Suggestions:</span>
          <button
            onClick={() => {
              setSearchQuery("What are mandatory radial vibration tolerance limits according to turbomachinery SOP?");
              handleSearchKnowledge("What are mandatory radial vibration tolerance limits according to turbomachinery SOP?");
            }}
            className="px-2.5 py-1 rounded-md bg-sovWarm-100 hover:bg-sovWarm-200 text-sovGraphite-700 text-[11px] transition"
          >
            Turbine vibration limits
          </button>
          <button
            onClick={() => {
              setSearchQuery("Bearing cavitation pitting acceptance thresholds in defence standards");
              handleSearchKnowledge("Bearing cavitation pitting acceptance thresholds in defence standards");
            }}
            className="px-2.5 py-1 rounded-md bg-sovWarm-100 hover:bg-sovWarm-200 text-sovGraphite-700 text-[11px] transition"
          >
            Bearing cavitation limits
          </button>
        </div>

        {/* Search Results / Citations */}
        {searchResults.length > 0 && (
          <div className="bg-white border border-sovBorder rounded-xl p-4 space-y-3 mt-4">
            <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle text-xs">
              <span className="font-semibold text-sovGraphite-900">
                Grounding citations
              </span>
              <span className="text-emerald-700 font-medium">{searchResults.length} matches found</span>
            </div>

            <div className="space-y-2">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-sovWarm-50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sovGraphite-900">
                      {res.section}
                    </span>
                    <span className="text-[11px] text-sovGraphite-400">
                      Page {res.page}
                    </span>
                  </div>
                  <div className="text-[11px] text-sovGraphite-400">
                    {res.source} · {res.department}
                  </div>
                  <p className="text-sovGraphite-700 italic pt-0.5 leading-relaxed">
                    "{res.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Knowledge Collections */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-sovGraphite-900">
          Knowledge collections
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {collections.map((col, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-sovBorder hover:border-sovBorder-strong transition space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sovGraphite-950">
                  {col.title}
                </span>
                <BookOpen className="w-4 h-4 text-sovGraphite-400" />
              </div>
              <p className="text-xs text-sovGraphite-500 leading-relaxed">
                {col.desc}
              </p>
              <div className="text-[11px] text-emerald-700 font-medium font-mono pt-1">
                {col.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Ingestion & Indexed Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Upload Form */}
        <div className="md:col-span-5 bg-white border border-sovBorder rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold text-sovGraphite-900 pb-2 border-b border-sovBorder-subtle">
            Add document to knowledge
          </h2>

          <form onSubmit={handleUpload} className="space-y-3 text-xs">
            <div>
              <label className="block text-sovGraphite-600 mb-1">Select document (PDF/TXT)</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-sovGraphite-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-sovWarm-100 file:text-sovGraphite-700 cursor-pointer bg-sovWarm-50 border border-sovBorder rounded-lg p-1"
              />
            </div>

            <div>
              <label className="block text-sovGraphite-600 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-sovWarm-50 border border-sovBorder rounded-lg px-3 py-1.5 text-sovGraphite-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full py-2 rounded-lg bg-sovGraphite-950 hover:bg-sovGraphite-900 text-white text-xs font-medium transition disabled:opacity-30"
            >
              {uploading ? "Indexing vectors..." : "Index into ChromaDB"}
            </button>

            {uploadMessage && (
              <p className="text-[11px] text-emerald-700 p-2 rounded bg-emerald-50">
                {uploadMessage}
              </p>
            )}
          </form>
        </div>

        {/* Indexed Docs List */}
        <div className="md:col-span-7 bg-white border border-sovBorder rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-sovBorder-subtle">
            <h2 className="text-xs font-semibold text-sovGraphite-900">
              Indexed documents
            </h2>
            <span className="text-[11px] text-sovGraphite-400">
              {docs.length} files in vector store
            </span>
          </div>

          <div className="divide-y divide-sovBorder-subtle">
            {docs.length === 0 ? (
              <div className="py-6 text-center text-sovGraphite-400 text-xs">
                No documents indexed yet.
              </div>
            ) : (
              docs.map((doc, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-3.5 h-3.5 text-sovBlue-600 shrink-0" />
                    <span className="font-medium text-sovGraphite-900 truncate">{doc.filename}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sovWarm-100 text-sovGraphite-500">
                      {doc.classification}
                    </span>
                    <span className="text-[11px] text-sovGraphite-400 font-mono">
                      {doc.total_pages} pg
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
