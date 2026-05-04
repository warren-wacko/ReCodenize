import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useMyPrompts,
  useMyStats,
  type LibraryView,
  type LibrarySort,
} from "../hooks/usePrompts";
import { useDeletePrompt } from "../hooks/useDeletePrompt";
import { Button } from "../components/ui/button";
import type { Prompt, Tool } from "../lib/types";
import { toast } from "sonner";
import "./Library.css";

const TOOL_LABELS: Record<Tool, string> = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  copilot: "Copilot",
  chatgpt: "ChatGPT",
  aider: "Aider",
  other: "Other",
};

const Lock = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <rect x="2.5" y="5" width="7" height="5.5" rx="1" stroke="currentColor" />
    <path d="M4 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" fill="none" />
  </svg>
);
const Globe = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" />
    <path
      d="M6 1.5c1.5 1.5 1.5 7.5 0 9M6 1.5c-1.5 1.5-1.5 7.5 0 9M1.5 6h9"
      stroke="currentColor"
    />
  </svg>
);
const Pencil = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M8.5 1.5l2 2-6 6-2.5.5.5-2.5 6-6z" stroke="currentColor" />
  </svg>
);
const Trash = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M2 3h8M4.5 1.5h3M3 3l.5 7.5h5L9 3M5 5v4M7 5v4"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);
const Plus = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeLinecap="round" />
  </svg>
);
const PlusBig = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeLinecap="round" />
  </svg>
);
const ArrowUp = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M6 2.5L10 8H2L6 2.5Z" fill="currentColor" />
  </svg>
);
const CopyI = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <rect
      x="3.5"
      y="1.5"
      width="6"
      height="7"
      rx="1"
      stroke="currentColor"
      fill="none"
    />
    <path
      d="M2 4v6.5h6"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4" stroke="currentColor" />
    <path d="M9.5 9.5L13 13" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

function ToolTag({ prompt }: { prompt: Prompt }) {
  return (
    <span className={`tool-tag tool-tag-${prompt.tool}`}>
      {TOOL_LABELS[prompt.tool]}
      <span style={{ opacity: 0.6, fontWeight: 300 }}>
        / {prompt.taskType}
      </span>
    </span>
  );
}

const dateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
const formatEdited = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, dateOpts);

function LibraryCard({ prompt }: { prompt: Prompt }) {
  const navigate = useNavigate();
  const deletePrompt = useDeletePrompt();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/library/${prompt._id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this prompt?")) return;
    try {
      await deletePrompt.mutateAsync(prompt._id);
      toast.success("Prompt deleted");
    } catch {
      // global mutationCache.onError toasts the failure
    }
  };

  return (
    <article
      className="lib-card"
      onClick={() => navigate(`/library/${prompt._id}/edit`)}
    >
      <div className="lib-card-head">
        <ToolTag prompt={prompt} />
        <span
          className={`lib-vis ${prompt.isPublic ? "public" : "private"}`}
          title={prompt.isPublic ? "Public" : "Private"}
        >
          {prompt.isPublic ? <Globe /> : <Lock />}
          {prompt.isPublic ? "Public" : "Private"}
        </span>
      </div>

      <h3 className="lib-card-title">{prompt.title}</h3>
      {prompt.description && (
        <p className="lib-card-desc">{prompt.description}</p>
      )}

      <div className="lib-card-stack">
        {prompt.stack.slice(0, 4).map((s) => (
          <span key={s} className="lib-stack-chip">
            {s}
          </span>
        ))}
        {prompt.stack.length > 4 && (
          <span className="lib-stack-more">+{prompt.stack.length - 4}</span>
        )}
      </div>

      <footer className="lib-card-foot">
        <div className="lib-card-stats">
          {prompt.isPublic ? (
            <>
              <span>
                <ArrowUp /> {prompt.upvoteCount.toLocaleString()}
              </span>
              <span>
                <CopyI /> {prompt.copyCount.toLocaleString()}
              </span>
            </>
          ) : (
            <span>edited {formatEdited(prompt.updatedAt)}</span>
          )}
        </div>
        <div className="lib-card-actions">
          <button
            className="lib-icon-btn"
            onClick={handleEdit}
            title="Edit"
            aria-label="Edit"
          >
            <Pencil />
          </button>
          <button
            className="lib-icon-btn lib-danger"
            onClick={handleDelete}
            title="Delete"
            aria-label="Delete"
            disabled={deletePrompt.isPending}
          >
            <Trash />
          </button>
        </div>
      </footer>
    </article>
  );
}

const SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: "recent", label: "Recently edited" },
  { value: "votes", label: "Most upvoted" },
  { value: "copies", label: "Most copied" },
];

const Library = () => {
  const [view, setView] = useState<LibraryView>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LibrarySort>("recent");

  const stats = useMyStats();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyPrompts({ view, sort, q: search });

  const prompts = data?.pages.flat() ?? [];
  const counts = stats.data ?? { total: 0, public: 0, private: 0 };

  const TABS: { value: LibraryView; label: string; n: number }[] = [
    { value: "all", label: "All", n: counts.total },
    { value: "public", label: "Public", n: counts.public },
    { value: "private", label: "Private", n: counts.private },
  ];

  const STAT_CELLS = [
    { n: stats.data?.total ?? 0, label: "Prompts", accent: false },
    { n: stats.data?.public ?? 0, label: "Public", accent: true },
    { n: stats.data?.private ?? 0, label: "Private", accent: false },
    { n: stats.data?.upvotes ?? 0, label: "Upvotes received", accent: false },
    { n: stats.data?.copies ?? 0, label: "Times copied", accent: false },
  ];

  return (
    <div className="lib-shell">
      <header className="lib-header">
        <div>
          <span className="section-tag">Library</span>
          <h1 className="lib-h1">Your prompts</h1>
          <p className="lib-sub">
            Your private working library. Mark prompts public to share them on
            Explore.
          </p>
        </div>
        <Link to="/library/new">
          <button className="lib-btn-primary">
            <Plus /> New prompt
          </button>
        </Link>
      </header>

      <div className="lib-stats">
        {STAT_CELLS.map((c) => (
          <div key={c.label} className="lib-stat">
            <div
              className="lib-stat-n"
              style={c.accent ? { color: "var(--lp-accent)" } : undefined}
            >
              {c.n.toLocaleString()}
            </div>
            <div className="lib-stat-l">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="lib-toolbar">
        <div className="lib-tabs">
          {TABS.map((t) => (
            <button
              key={t.value}
              className={`lib-tab ${view === t.value ? "active" : ""}`}
              onClick={() => setView(t.value)}
            >
              {t.label} <span className="lib-tab-n">{t.n}</span>
            </button>
          ))}
        </div>
        <div className="lib-tools-r">
          <div className="lib-search-wrap">
            <SearchIcon />
            <input
              placeholder="Search your prompts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="lib-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as LibrarySort)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="lib-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="lib-card"
              style={{ height: 220, opacity: 0.4, cursor: "default" }}
            />
          ))}
        </div>
      ) : prompts.length === 0 && counts.total === 0 ? (
        <div className="lib-empty">
          <h3>No prompts yet</h3>
          <p>Save your first one — paste a prompt you reuse.</p>
          <Link to="/library/new">
            <Button>+ New prompt</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="lib-grid">
            {prompts.map((p) => (
              <LibraryCard key={p._id} prompt={p} />
            ))}
            {!hasNextPage && (
              <Link to="/library/new" style={{ textDecoration: "none" }}>
                <button className="lib-card lib-card-add">
                  <span className="lib-card-add-icon">
                    <PlusBig />
                  </span>
                  <span>New prompt</span>
                </button>
              </Link>
            )}
          </div>

          {hasNextPage && (
            <div className="lib-load-more">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
