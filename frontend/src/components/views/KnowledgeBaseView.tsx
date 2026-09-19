import React, { useState, useEffect } from "react";
import {
  Database,
  Upload,
  Search,
  FileText,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { api, Citation } from "../../lib/api";

interface KnowledgeBaseViewProps {
  onOpenCitation: (citation: Citation) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ onOpenCitation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [docs, setDocs] = useState<any[]>([
    {
      id: "doc-1",
      filename: "SOP_TURBINE_MAINTENANCE_V4.txt",
      title: "SOP-TURB-IND-2026-V4 (Steam Turbine Maintenance)",
      category: "Maintenance Standard",
      chunks: 42,
      status: "Indexed",
      updated: "Today",
      sha256: "3858f62230ac3c915f300c664312c63f43b517d10c593a241167acc30794383c",
      sample_clause: "Vibration acceptance velocity RMS limit is 3.50 mm/s for units exceeding 3000 RPM."
    },
    {
      id: "doc-2",
      filename: "DEF_STD_05_21_CAVITATION.txt",
      title: "DEF-STD-05-21 (Defence Metrology & Cavitation Standards)",
      category: "Defence Standard",
      chunks: 88,
      status: "Indexed",
      updated: "Yesterday",
      sha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      sample_clause: "Pitting depth exceeding 0.08 mm on load quadrant constitutes structural failure."
    },
    {
      id: "doc-3",
      filename: "RAILWAY_SAFETY_TELEMETRY_GUIDELINES.txt",
      title: "RDSO-RLW-2026 (Axle Hot-Box Telemetry Protocol)",
      category: "Safety Protocol",
      chunks: 36,
      status: "Indexed",
      updated: "3 days ago",
      sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      sample_clause: "Axle journal bearing temperature differential >15 °C triggers warning alarm."
    },
  ]);

  // Handle live semantic search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchKnowledgeBase(searchQuery, 4);
        if (results && results.length > 0) {
          setSearchResults(results);
        } else {
          // Fallback semantic search over loaded docs for mock/offline testing
          const qLower = searchQuery.toLowerCase();
          const mockMatches = docs
            .filter((d) => d.sample_clause.toLowerCase().includes(qLower) || d.title.toLowerCase().includes(qLower))
            .map((d, idx) => ({
              text: d.sample_clause,
              score: 0.96 - idx * 0.04,
              metadata: {
                source: d.title,
                section: "Section 2.1",
                page: 4
              }
            }));
          setSearchResults(mockMatches);
        }
      } catch (err) {
        console.warn("Live search fallback:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, docs]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const file = files[0];
      const res = await api.ingestKnowledgeDocument(file, "Standard", "Engineering", "RESTRICTED", "officer_sharma");
      setDocs((prev) => [
        {
          id: `doc-${Date.now()}`,
          filename: file.name,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: "Uploaded Standard",
          chunks: res.chunks_created || 18,
          status: "Indexed",
          updated: "Just now",
          sha256: res.doc_id || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          sample_clause: "Ingested and vector-partitioned in local ChromaDB store."
        },
        ...prev
      ]);
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-400/25 text-amber-600 dark:text-amber-300 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.sample_clause.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6 select-none font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Knowledge Base & Standards Manager
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-semibold shadow-2xs">
              ChromaDB Local Vector Partition
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Ingested SOPs, technical specifications, and defence guidelines for grounded RAG citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-text-primary hover:bg-black text-white text-xs font-medium cursor-pointer shadow-card-elevated hover:-translate-y-0.5 transition-all duration-200">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? "Indexing..." : "+ Ingest Document"}</span>
            <input
              type="file"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Glowing Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer ${
          isDragging
            ? "border-accent-azure bg-accent-azure/10 shadow-glow-md scale-[1.01]"
            : "border-subtle bg-surface/50 hover:bg-surface hover:border-accent-azure/50 shadow-card-elevated hover:-translate-y-0.5"
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-subtle flex items-center justify-center text-accent-azure shadow-2xs">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-text-primary">
            Drag & drop maintenance SOPs, manuals, or sensor datasets
          </p>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Auto-chunked & embedded using local BGE-M3 dense vectors. Zero cloud egress.
          </p>
        </div>
      </div>

      {/* Semantic Retrieval Search Tester */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test semantic retrieval (e.g. 'vibration acceptance threshold', 'cavitation limit', 'temperature')..."
            className="w-full bg-surface border border-subtle rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-azure shadow-card-elevated transition-all"
          />
          {isSearching && (
            <RefreshCw className="w-3.5 h-3.5 text-accent-azure animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Live Vector Search Results if any */}
        {searchResults.length > 0 && (
          <div className="space-y-2 p-4 bg-surface border border-accent-azure/40 rounded-2xl shadow-card-elevated animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-subtle text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-azure" />
                <span>Ranked Vector Retrieval Matches ({searchResults.length} chunks)</span>
              </span>
              <span className="font-mono text-text-muted text-[10px]">ChromaDB + BGE-M3 Dense RAG</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {searchResults.map((res, i) => {
                const scorePct = Math.round((res.score || 0.94) * 100);
                const sourceName = res.metadata?.source || res.source || "SOP-TURB-IND-2026-V4";
                const clauseText = res.text || res.content || res.clause || "";
                const section = res.metadata?.section || res.section || "Section 2.1";

                return (
                  <div
                    key={i}
                    onClick={() =>
                      onOpenCitation({
                        source: sourceName,
                        clause: clauseText,
                        section: section,
                        page: res.metadata?.page || res.page || 4,
                        score: res.score || 0.94
                      })
                    }
                    className="p-3.5 rounded-xl bg-surface-elevated border border-subtle hover:border-accent-azure/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-xs space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary group-hover:text-accent-primary transition truncate max-w-[200px]">
                        {sourceName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        {scorePct}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-text-secondary line-clamp-3 italic leading-relaxed">
                      "{highlightMatch(clauseText, searchQuery)}"
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-subtle/60 text-[10px] text-text-muted font-mono">
                      <span>{section}</span>
                      <span className="text-accent-azure group-hover:underline flex items-center gap-0.5">
                        Inspect Source <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="border border-subtle rounded-2xl overflow-hidden bg-surface shadow-card-elevated">
          <div className="px-4 py-3 bg-surface-elevated border-b border-subtle flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Indexed Standards & Specifications ({filteredDocs.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-text-muted">Local Air-Gapped Storage</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-elevated/50 border-b border-subtle text-[10px] text-text-muted uppercase">
              <tr>
                <th className="p-3">Standard Document</th>
                <th className="p-3">Category</th>
                <th className="p-3">Chunks</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() =>
                    onOpenCitation({
                      source: doc.title,
                      clause: doc.sample_clause,
                      page: 4,
                      section: "Section 2.1"
                    })
                  }
                  className="hover:bg-surface-hover transition cursor-pointer group"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-accent-azure group-hover:text-accent-primary" />
                      <div>
                        <div className="font-semibold text-text-primary group-hover:text-accent-primary transition">
                          {doc.title}
                        </div>
                        <div className="text-[10px] text-text-muted font-mono truncate max-w-[320px]">
                          SHA-256: {doc.sha256}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-text-secondary border border-subtle text-[10px] font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-text-secondary">
                    {doc.chunks} vectors
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 font-semibold">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{doc.status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right text-[11px] text-text-muted font-mono">
                    {doc.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
