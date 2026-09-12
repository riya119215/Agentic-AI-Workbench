import React, { useState, useEffect } from "react";
import { UploadCloud, FileCheck, Database, ShieldAlert, Layers, RefreshCw } from "lucide-react";
import { api, UserProfile } from "../lib/api";

interface KnowledgeBaseHubProps {
  currentUser: UserProfile | null;
}

export const KnowledgeBaseHub: React.FC<KnowledgeBaseHubProps> = ({ currentUser }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [department, setDepartment] = useState("Turbomachinery QA");
  const [classification, setClassification] = useState("RESTRICTED");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

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
      setUploadMessage(`Successfully ingested and indexed ${selectedFile.name} in ChromaDB.`);
      setSelectedFile(null);
      await loadDocs();
    } catch (err: any) {
      setUploadMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Database className="w-6 h-6 text-blue-400" />
            <span>Sovereign Knowledge Base (On-Premise Multimodal RAG)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Indexed locally via BGE-M3 Embedder into ChromaDB Persistent Store. Zero external cloud exposure.
          </p>
        </div>
        <button
          onClick={loadDocs}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 transition-all self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Knowledge Base</span>
        </button>
      </div>

      {/* Grid: Upload Box + Indexed Docs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Ingest Box */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 text-blue-400" />
            <span>Ingest Sovereign Document</span>
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Select Document / Scanned PDF / Manual
              </label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600/30 file:text-blue-300 hover:file:bg-blue-600/50 cursor-pointer bg-slate-950 border border-slate-800 rounded-lg p-1.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Department Wing
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Security Classification
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                <option value="RESTRICTED">RESTRICTED / OFFICIAL</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="TOP_SECRET">TOP SECRET (RESTRICTED ACCESS)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className={`w-full py-2 px-4 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                !selectedFile || uploading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Parsing & Indexing Vectors...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Parse & Ingest to RAG</span>
                </>
              )}
            </button>

            {uploadMessage && (
              <p className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 p-2 rounded border border-emerald-500/30">
                {uploadMessage}
              </p>
            )}
          </form>
        </div>

        {/* Indexed Documents Table */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Active Indexed Repositories (ChromaDB)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {docs.length} Source Document(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Document Title</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3 text-right">Indexed Pages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {docs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 font-mono">
                      No documents ingested yet. Upload an SOP or run the flagship inspection demo.
                    </td>
                  </tr>
                ) : (
                  docs.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-200 flex items-center space-x-2">
                        <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="truncate max-w-[220px]">{doc.filename}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{doc.department}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          {doc.classification}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {doc.total_pages} pg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
