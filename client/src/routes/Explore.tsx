import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useExplore } from "../hooks/useExplore";
import { useTrending } from "../hooks/useTrending";
import { useFiltersStore, type ExploreSort } from "../stores/filters";
import { useAuthStore } from "../stores/auth";
import { useVote } from "../hooks/useVote";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";
import { formatRelative, avatarColor } from "../lib/time";
import type { Prompt, Tool } from "../lib/types";
import "./Explore.css";

const TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  copilot: "Copilot",
  chatgpt: "ChatGPT",
  aider: "Aider",
  other: "Other",
};

const TOOL_OPTIONS: { value: Tool | "all"; label: string }[] = [
  { value: "all", label: "All tools" },
  { value: "cursor", label: "Cursor" },
  { value: "claude-code", label: "Claude Code" },
  { value: "copilot", label: "Copilot" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "aider", label: "Aider" },
];

const TOOL_DOT_COLOR: Record<string, string> = {
  cursor: "var(--lp-red)",
  "claude-code": "var(--lp-blue)",
  copilot: "var(--lp-purple)",
  chatgpt: "var(--lp-accent)",
  aider: "oklch(72% 0.14 170)",
  other: "var(--lp-text-mid)",
};

const SORT_OPTIONS: { value: ExploreSort; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "new", label: "New" },
  { value: "copied", label: "Most copied" },
];

const SparkleIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1L7 5L11 6L7 7L6 11L5 7L1 6L5 5L6 1Z"
      fill="currentColor"
    />
  </svg>
);
const ArrowUpIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M6 2.5L10 8H2L6 2.5Z" fill="currentColor" />
  </svg>
);
const CopyIcon = () => (
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4" stroke="currentColor" />
    <path d="M9.5 9.5L13 13" stroke="currentColor" strokeLinecap="round" />
  </svg>
);

function ToolTag({ prompt }: { prompt: Prompt }) {
  return (
    <span className={`tool-tag tool-tag-${prompt.tool}`}>
      {TOOL_LABELS[prompt.tool] ?? prompt.tool}
      <span style={{ opacity: 0.6, fontWeight: 300 }}>
        / {prompt.taskType}
      </span>
    </span>
  );
}

function Avatar({
  prompt,
  size = "md",
}: {
  prompt: Prompt;
  size?: "sm" | "md";
}) {
  const name = prompt.author?.name ?? "?";
  const initial = name.charAt(0).toUpperCase();
  const color = avatarColor(prompt.author?._id ?? prompt.userId);
  const className = size === "sm" ? "ex-avatar-sm" : "ex-avatar";

  if (prompt.author?.avatarUrl) {
    return (
      <img
        src={prompt.author.avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className={className}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return (
    <span className={className} style={{ background: color }}>
      {initial}
    </span>
  );
}

function ExploreCard({
  prompt,
  featured,
}: {
  prompt: Prompt;
  featured?: boolean;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const vote = useVote(prompt._id);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    vote.mutate();
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(prompt.body);
      toast.success("Copied to clipboard");
      api(`/api/prompts/${prompt._id}/copy`, { method: "POST" }).catch(() => {
        // fire-and-forget
      });
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <article
      className="ex-card"
      onClick={() => navigate(`/p/${prompt._id}`)}
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <div className="ex-card-head">
        <ToolTag prompt={prompt} />
        {featured && (
          <span className="ex-featured-pill">
            <SparkleIcon /> Featured
          </span>
        )}
      </div>

      <h3 className="ex-card-title">{prompt.title}</h3>
      {prompt.description && (
        <p className="ex-card-desc">{prompt.description}</p>
      )}
      <pre className="ex-card-body">{prompt.body}</pre>

      {prompt.stack.length > 0 && (
        <div className="ex-card-meta">
          <div className="ex-stack">
            {prompt.stack.slice(0, 3).map((s) => (
              <span key={s} className="ex-stack-chip">
                {s}
              </span>
            ))}
            {prompt.stack.length > 3 && (
              <span className="ex-stack-more">
                +{prompt.stack.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      <footer className="ex-card-foot">
        <div className="ex-author">
          <Avatar prompt={prompt} />
          <span className="ex-author-name">
            {prompt.author?.name ?? "—"}
          </span>
          <span className="ex-author-time">
            · {formatRelative(prompt.createdAt)}
          </span>
        </div>
        <div className="ex-actions">
          <button
            className={`ex-vote ${prompt.hasVoted ? "voted" : ""}`}
            onClick={handleVote}
            title="Upvote"
          >
            <ArrowUpIcon />
            <span>{prompt.upvoteCount.toLocaleString()}</span>
          </button>
          <button className="ex-copy" onClick={handleCopy} title="Copy prompt">
            <CopyIcon />
            <span>{prompt.copyCount.toLocaleString()}</span>
          </button>
        </div>
      </footer>
    </article>
  );
}

function ExploreRow({ prompt }: { prompt: Prompt }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const vote = useVote(prompt._id);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    vote.mutate();
  };

  return (
    <div
      className="ex-row"
      onClick={() => navigate(`/p/${prompt._id}`)}
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer" }}
    >
      <button
        className={`ex-row-vote ${prompt.hasVoted ? "voted" : ""}`}
        onClick={handleVote}
      >
        <ArrowUpIcon />
        <span>{prompt.upvoteCount.toLocaleString()}</span>
      </button>
      <div className="ex-row-main">
        <div className="ex-row-head">
          <h3 className="ex-row-title">{prompt.title}</h3>
        </div>
        {prompt.description && (
          <p className="ex-row-desc">{prompt.description}</p>
        )}
        <div className="ex-row-meta">
          <ToolTag prompt={prompt} />
          {prompt.stack.length > 0 && (
            <>
              <span className="ex-row-sep">·</span>
              <div className="ex-stack">
                {prompt.stack.slice(0, 3).map((s) => (
                  <span key={s} className="ex-stack-chip">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
          <span className="ex-row-sep">·</span>
          <span className="ex-row-author">
            <Avatar prompt={prompt} size="sm" />
            {prompt.author?.name ?? "—"} · {formatRelative(prompt.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

const Explore = () => {
  const {
    tool,
    search,
    sort,
    setTool,
    setSearch,
    setSort,
    reset,
  } = useFiltersStore();
  const taskType = useFiltersStore((s) => s.taskType);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExplore({ tool, taskType, q: search, sort });

  const trendingQuery = useTrending();
  const trending = trendingQuery.data ?? [];

  const allFetched = data?.pages.flat() ?? [];
  const trendingIds = new Set(trending.map((p) => p._id));
  const rest = allFetched.filter((p) => !trendingIds.has(p._id));

  const hasActiveFilters =
    tool !== "all" || taskType !== "all" || search !== "" || sort !== "top";

  return (
    <div className="ex-shell">
      <header className="ex-header-c">
        <span className="section-tag">Explore · Curated</span>
        <h1 className="ex-h1-c">
          Prompts that <em>actually</em> ship code.
        </h1>
        <p className="ex-main-sub">
          Hand-picked from the community library. Sorted by what people copy,
          not by what they upvote.
        </p>
      </header>

      {trending.length > 0 && (
        <div className="ex-trending">
          <div className="ex-trending-head">
            <SparkleIcon />
            <span>Trending this week</span>
          </div>
          <div className="ex-hero-grid">
            <div className="ex-hero-feature">
              <ExploreCard prompt={trending[0]} featured />
            </div>
            <div className="ex-hero-stack">
              {trending.slice(1, 3).map((p) => (
                <ExploreRow key={p._id} prompt={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="ex-toolbar ex-toolbar-tight">
        <div className="ex-search-wrap">
          <span className="ex-search-icon">
            <SearchIcon />
          </span>
          <input
            className="ex-search"
            placeholder="Search the library…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="ex-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="ex-segmented">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.value}
              className={`ex-seg ${sort === s.value ? "active" : ""}`}
              onClick={() => setSort(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ex-chip-row">
        {TOOL_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`lp-chip ${tool === o.value ? "active" : ""}`}
            onClick={() => setTool(o.value)}
          >
            {o.value !== "all" && (
              <span
                className="ex-tool-dot"
                style={{ background: TOOL_DOT_COLOR[o.value] }}
              />
            )}
            {o.label}
          </button>
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset}>
            Clear
          </Button>
        )}
      </div>

      <div className="ex-results-head">
        <span>
          <b>All prompts</b> ·{" "}
          {isLoading
            ? "loading…"
            : `${allFetched.length} ${
                allFetched.length === 1 ? "result" : "results"
              }`}
        </span>
      </div>

      {isLoading ? (
        <div className="ex-grid-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="ex-card"
              style={{ height: 240, opacity: 0.4 }}
            />
          ))}
        </div>
      ) : rest.length === 0 && allFetched.length === 0 ? (
        <div className="ex-empty">
          <div className="ex-empty-icon">∅</div>
          <h3>No prompts match these filters.</h3>
          <p>
            Try removing a filter, or be the first to post one for this
            combination.
          </p>
          <Button variant="outline" onClick={reset}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="ex-grid-2">
            {rest.map((p) => (
              <ExploreCard key={p._id} prompt={p} />
            ))}
          </div>
          {hasNextPage && (
            <div className="ex-load-more">
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

export default Explore;
