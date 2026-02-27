import {
  IoDocumentTextOutline,
  IoCloseOutline,
  IoDownloadOutline,
} from "react-icons/io5";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSimilarityColor(pct = 0) {
  if (pct <= 20) return { dot: "#22c55e", bar: "#22c55e", text: "#16a34a" };
  if (pct <= 40) return { dot: "#f59e0b", bar: "#f59e0b", text: "#d97706" };
  return { dot: "#ef4444", bar: "#ef4444", text: "#dc2626" };
}

function getProgramName(program) {
  if (!program) return "—";
  if (typeof program === "string") return program;
  return program.program_name ?? program.name ?? program.title ?? "—";
}

function StatusBadge({ status }) {
  const map = {
    approved: "text-green-700 border-green-400",
    pending:  "text-orange-500 border-orange-400",
    rejected: "text-red-600 border-red-400",
    flagged:  "text-gray-600 border-gray-400",
  };
  const key = status?.toLowerCase();
  const label = key ? key.charAt(0).toUpperCase() + key.slice(1) : "—";
  return (
    <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold bg-white border ${map[key] || "border-gray-300 text-gray-500"}`}>
      {label}
    </span>
  );
}

// ─── PaperDetailsModal ────────────────────────────────────────────────────────
export default function PaperDetailsModal({ isOpen, onClose, paper }) {
  if (!isOpen || !paper) return null;

  const paperId = paper.paper_id || paper.id;
  const sim     = paper.similarity_percentage ?? 0;
  const stat    = paper.status?.toLowerCase();
  const { dot, bar, text: simText } = getSimilarityColor(sim);

  // Citation — tries every possible field name
  const citationValue =
    paper.citation_count  ??
    paper.citations       ??
    paper.citation        ??
    paper.citations_count ??
    paper.cite_count      ??
    paper.num_citations   ??
    null;
  const citationDisplay =
    citationValue !== null && citationValue !== undefined
      ? String(citationValue)
      : "—";

  // Debug: uncomment to see all paper fields
  // console.log("Paper fields:", Object.keys(paper), paper);

  // Keywords — tries all possible field names the API might return
  // Try every possible field name
  const rawKeywords =
    paper.keywords ??
    paper.keyword ??
    paper.tags ??
    paper.key_words ??
    paper.research_keywords ??
    null;

  let keywords = [];
  if (Array.isArray(rawKeywords)) {
    keywords = rawKeywords;
  } else if (typeof rawKeywords === "string" && rawKeywords.length > 0) {
    try {
      const parsed = JSON.parse(rawKeywords);
      keywords = Array.isArray(parsed)
        ? parsed
        : rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    } catch {
      keywords = rawKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    }
  }

  const downloadUrl = `http://127.0.0.1:8000/api/research-papers/${paperId}/download`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5 pr-4">
            <IoDocumentTextOutline className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <h2 className="text-sm font-semibold text-gray-900 leading-snug">
              {paper.title ?? "Untitled"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoCloseOutline className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 divide-y divide-gray-100">

          {/* Academic Program + Year Level */}
          <div className="grid grid-cols-2 gap-x-8 py-4">
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Academic Program</p>
              <p className="text-sm text-gray-800 font-medium">{getProgramName(paper.program)}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Year Level</p>
              <p className="text-sm text-gray-800 font-medium">{paper.year_level ?? "—"}</p>
            </div>
          </div>

          {/* Submitted By + Date Submitted */}
          <div className="grid grid-cols-2 gap-x-8 py-4">
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Submitted By</p>
              <p className="text-sm text-gray-800 font-medium">
                {paper.student?.user?.name ?? paper.author ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Date Submitted</p>
              <p className="text-sm text-gray-800 font-medium">
                {paper.date_submitted || paper.created_at
                  ? new Date(paper.date_submitted || paper.created_at).toLocaleDateString("en-US", {
                      month: "numeric", day: "numeric", year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Abstract */}
          <div className="py-4">
            <p className="text-[11px] text-gray-400 mb-1">Abstract</p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {paper.abstract ?? "No abstract available."}
            </p>
          </div>

          {/* Keywords */}
          <div className="py-4">
            <p className="text-[11px] text-gray-400 mb-2">Keywords</p>
<div className="flex flex-wrap gap-2">
                {keywords.length > 0
                  ? keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                      >
                        {kw}
                      </span>
                    ))
                  : <span className="text-sm text-gray-400">No keywords</span>
                }
              </div>
          </div>

          {/* Citation + Similarity */}
          <div className="grid grid-cols-2 gap-x-8 py-4">
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Citation</p>
              <p className="text-sm text-gray-800 font-medium">{citationDisplay}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Similarity</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${Math.min(sim, 100)}%`, backgroundColor: bar }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: simText }}>{sim}%</span>
              </div>
            </div>
          </div>

          {/* Status + Document Type */}
          <div className="grid grid-cols-2 gap-x-8 py-4">
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5">Status</p>
              <StatusBadge status={stat} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-1">Document Type</p>
              <p className="text-sm text-gray-800 font-medium capitalize">
                {paper.document_type ?? paper.type ?? "—"}
              </p>
            </div>
          </div>

        </div>

        {/* ── Footer — all buttons centered ── */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 bg-[#134F4F] text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition-colors"
          >
            <IoDownloadOutline className="w-4 h-4" />
            Download PDF
          </a>
          <button
            onClick={() => window.open("https://www.turnitin.com", "_blank")}
            className="flex items-center gap-2 px-5 py-2 bg-orange-50 text-orange-500 border border-orange-200 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors"
          >
            <ChartNoAxesColumnIncreasing className="w-4 h-4" />
            View Similarity
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}