import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import "./Landing.css";

type SamplePrompt = {
  id: number;
  toolLabel: string;
  tagClass: string;
  taskType: string;
  title: string;
  body: string;
  votes: number;
};

const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: 1,
    toolLabel: "Cursor",
    tagClass: "tag-cursor",
    taskType: "refactor",
    title: "Eliminate dead code pass",
    body: "Review this file and identify any unused variables, dead code branches, or functions that are never called. Explain each removal and ensure nothing is needed for side effects.",
    votes: 847,
  },
  {
    id: 2,
    toolLabel: "Claude Code",
    tagClass: "tag-claude",
    taskType: "scaffold",
    title: "CLAUDE.md system prompt",
    body: "You are working in a monorepo. Before making changes, always read the relevant README, check for existing patterns in the codebase, and run the linter before declaring a task done.",
    votes: 1204,
  },
  {
    id: 3,
    toolLabel: "ChatGPT",
    tagClass: "tag-chatgpt",
    taskType: "review",
    title: "Security audit checklist",
    body: "Act as a senior security engineer. Review the following API handler for: SQL injection, improper auth checks, rate limiting, input sanitization, and sensitive data exposure.",
    votes: 563,
  },
  {
    id: 4,
    toolLabel: "Cursor",
    tagClass: "tag-cursor",
    taskType: "test",
    title: "Generate edge-case unit tests",
    body: "Write comprehensive unit tests for this function. Cover: happy path, boundary values, null/undefined inputs, unexpected types, and any error states the function can throw.",
    votes: 432,
  },
  {
    id: 5,
    toolLabel: "Claude Code",
    tagClass: "tag-claude",
    taskType: "debug",
    title: "Root cause analysis mode",
    body: "Don't just fix the symptom. Trace the bug to its root cause. Show your reasoning step by step before writing any code. If it requires changing more than one file, ask me first.",
    votes: 991,
  },
  {
    id: 6,
    toolLabel: "Copilot",
    tagClass: "tag-copilot",
    taskType: "scaffold",
    title: "React component scaffold",
    body: "Scaffold a new React component following project conventions: typed props interface, named export, jsdoc comment at the top, and a Storybook story file alongside it.",
    votes: 318,
  },
];

const TOOLS = ["All", "Cursor", "Claude Code", "Copilot", "ChatGPT", "Aider"];
const TASKS = [
  "All",
  "Refactor",
  "Scaffold",
  "Debug",
  "Test",
  "Review",
  "Explain",
  "Rules",
];

const FEATURES = [
  {
    icon: "📚",
    title: "Personal Library",
    desc: "Save any prompt — system prompt, inline instruction, rules file, context block. Tag it by tool, task type, and stack.",
  },
  {
    icon: "🔍",
    title: "Explore Feed",
    desc: "Browse public prompts from the community. Filter by tool, task type, or stack. Copy in one click.",
  },
  {
    icon: "⬆",
    title: "Upvotes & Forks",
    desc: "The best prompts rise. Fork any public prompt into your own library and customize it for your workflow.",
  },
  {
    icon: "🔗",
    title: "Shareable Links",
    desc: "Every public prompt gets its own URL. Drop it in Slack, link it in a PR, or share it on Twitter.",
  },
  {
    icon: "🏷",
    title: "Smart Filtering",
    desc: "Slice the feed by tool, task type, and stack. Search across titles, bodies, and descriptions.",
  },
  {
    icon: "🔒",
    title: "Private by Default",
    desc: "Prompts are private until you choose to share them. Your personal library is yours alone.",
  },
];

const TOOL_BADGES = [
  { name: "Cursor", color: "var(--red)" },
  { name: "Claude Code", color: "var(--blue)" },
  { name: "Copilot", color: "var(--purple)" },
  { name: "ChatGPT", color: "var(--accent)" },
  { name: "Aider", color: "oklch(72% 0.14 170)" },
  { name: "Windsurf", color: "oklch(72% 0.12 200)" },
];

function FadeUp({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="fade-up"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HeroCard({ prompt }: { prompt: SamplePrompt }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="prompt-card">
      <div className={`prompt-card-tool ${prompt.tagClass}`}>
        {prompt.toolLabel}
        <span style={{ opacity: 0.6, fontWeight: 300 }}>
          / {prompt.taskType}
        </span>
      </div>
      <div className="prompt-card-title">{prompt.title}</div>
      <div className="prompt-card-body">{prompt.body}</div>
      <div className="prompt-card-footer">
        <span className="prompt-card-votes">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2L10 8H2L6 2Z" fill="currentColor" opacity="0.7" />
          </svg>
          {prompt.votes.toLocaleString()}
        </span>
        <button type="button" className="prompt-card-copy" onClick={handleCopy}>
          {copied ? "copied ✓" : "copy →"}
        </button>
      </div>
    </div>
  );
}

function ExploreCard({ prompt }: { prompt: SamplePrompt }) {
  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(prompt.votes);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const handleVote = () => {
    setVoted((v) => !v);
    setVotes((v) => (voted ? v - 1 : v + 1));
  };

  const voteStyle: CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: voted ? "var(--accent)" : "var(--text-dim)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    transition: "color 0.12s",
  };

  return (
    <div className="prompt-card">
      <div className={`prompt-card-tool ${prompt.tagClass}`}>
        {prompt.toolLabel}
        <span style={{ opacity: 0.6, fontWeight: 300 }}>
          / {prompt.taskType}
        </span>
      </div>
      <div className="prompt-card-title">{prompt.title}</div>
      <div className="prompt-card-body">{prompt.body}</div>
      <div className="prompt-card-footer">
        <button
          type="button"
          className="prompt-card-votes"
          style={voteStyle}
          onClick={handleVote}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2L10 8H2L6 2Z"
              fill="currentColor"
              style={{ opacity: voted ? 1 : 0.7 }}
            />
          </svg>
          {votes.toLocaleString()}
        </button>
        <button type="button" className="prompt-card-copy" onClick={handleCopy}>
          {copied ? "copied ✓" : "copy →"}
        </button>
      </div>
    </div>
  );
}

const GoogleCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5.5 8L7.5 10L10.5 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Landing = () => {
  const user = useAuthStore((s) => s.user);
  const [activeTool, setActiveTool] = useState("All");
  const [activeTask, setActiveTask] = useState("All");

  const filtered = SAMPLE_PROMPTS.filter((p) => {
    const toolMatch = activeTool === "All" || p.toolLabel === activeTool;
    const taskMatch =
      activeTask === "All" ||
      p.taskType.toLowerCase() === activeTask.toLowerCase();
    return toolMatch && taskMatch;
  });

  // CTA destination depends on auth — logged-in users skip /login
  const primaryCtaTo = user ? "/library" : "/login";
  const primaryCtaLabel = user ? "Go to your library" : "Sign in with Google";

  return (
    <div className="landing-page">
      {/* NAV */}
      <nav className="lp-nav">
        <Link to="/" className="nav-logo">
          <span className="nav-logo-dot" />
          ReCodenize
        </Link>
        <div className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#features">Features</a>
          <a href="#story">Story</a>
          <Link to={primaryCtaTo} className="nav-cta">
            {user ? "Library" : "Sign in with Google"}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />

        <div className="hero-eyebrow">The library for how you code with AI</div>

        <h1 className="hero-headline">
          Your AI coding prompts,
          <br />
          <em>finally organized.</em>
        </h1>

        <p className="hero-sub">
          Stop losing your best prompts in Notion docs and scattered{" "}
          <code>.md</code> files. ReCodenize is the shared library for the
          prompts, rules, and context blocks that make your AI generate great
          code.
        </p>

        <div className="hero-actions">
          <Link to={primaryCtaTo} className="btn-primary">
            <GoogleCheckIcon />
            {primaryCtaLabel}
          </Link>
          <a href="#explore" className="btn-secondary">
            Browse Explore →
          </a>
        </div>

        <div className="hero-cards">
          {SAMPLE_PROMPTS.slice(0, 3).map((p) => (
            <HeroCard key={p.id} prompt={p} />
          ))}
        </div>
      </section>

      {/* TOOLS STRIP */}
      <div className="tools-section">
        <span className="tools-label">Works with every AI coding tool</span>
        <div className="tools-strip">
          {TOOL_BADGES.map((t) => (
            <div
              key={t.name}
              className="tool-badge"
              style={{ color: t.color, borderColor: `${t.color}33` }}
            >
              <span className="tool-badge-dot" />
              {t.name}
            </div>
          ))}
        </div>
      </div>

      {/* STORY */}
      <section
        id="story"
        className="lp-section"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="story-grid">
          <div>
            <FadeUp>
              <span className="section-tag">Origin story</span>
              <h2 className="section-headline">
                Started as a snippet manager.
                <br />
                <em style={{ fontStyle: "italic", color: "var(--text-mid)" }}>
                  Rebuilt for the AI age.
                </em>
              </h2>
            </FadeUp>
            <FadeUp delay={100}>
              <p className="section-body">
                Devs stopped writing boilerplate by hand in 2023. But now every
                developer has a hidden personal library — prompts, rules files,
                context blocks — scattered everywhere and shared with nobody.
                ReCodenize is built for that.
              </p>
            </FadeUp>
          </div>

          <div className="story-right">
            <FadeUp delay={150}>
              <div className="story-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-year">2020</div>
                    <div className="timeline-text">
                      <strong>ReCodenize v1</strong> — a code snippet manager
                      for boilerplate. Devs were copying functions by hand,
                      re-typing the same patterns.
                    </div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot" />
                  <div>
                    <div className="timeline-year">2023</div>
                    <div className="timeline-text">
                      <strong>Copilot, ChatGPT, Cursor go mainstream.</strong>{" "}
                      Boilerplate is dead. The product goes quiet. But something
                      else is growing: prompt hoarding.
                    </div>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot active" />
                  <div>
                    <div className="timeline-year">2026</div>
                    <div className="timeline-text">
                      <strong>ReCodenize v2</strong> — rebuilt from scratch for
                      the prompts, rules, and context snippets that actually
                      make AI produce great code.
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="lp-section"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <FadeUp>
          <div className="features-header">
            <span className="section-tag">What it does</span>
            <h2 className="section-headline">
              Everything your prompt library needs
            </h2>
            <p className="section-body">
              Save, tag, and organize your best prompts. Share the ones that
              work. Fork the ones others have refined.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={100}>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-cell">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* EXPLORE PREVIEW */}
      <div className="explore-section" id="explore">
        <div className="explore-inner">
          <FadeUp>
            <div className="explore-header">
              <div>
                <span className="section-tag">Explore</span>
                <h2 className="section-headline" style={{ marginBottom: 0 }}>
                  Community prompts
                </h2>
              </div>
              <Link
                to="/explore"
                className="btn-secondary"
                style={{ fontSize: 13 }}
              >
                View all →
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={80}>
            <div className="filter-chips">
              {TOOLS.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip ${activeTool === t ? "active" : ""}`}
                  onClick={() => setActiveTool(t)}
                >
                  {t}
                </button>
              ))}
              <span className="chip-divider" />
              {TASKS.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip ${activeTask === t ? "active" : ""}`}
                  onClick={() => setActiveTask(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </FadeUp>

          {filtered.length > 0 ? (
            <div className="explore-cards">
              {filtered.slice(0, 6).map((p, i) => (
                <FadeUp key={p.id} delay={i * 60}>
                  <ExploreCard prompt={p} />
                </FadeUp>
              ))}
            </div>
          ) : (
            <div className="explore-empty">
              No prompts match this combination yet — be the first to add one.
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <FadeUp>
          <p className="cta-eyebrow">Free to join</p>
          <h2 className="cta-headline">Stop losing your best prompts.</h2>
          <p className="cta-sub">
            Your hidden prompt library deserves a real home.
          </p>
          <div className="cta-actions">
            <Link to={primaryCtaTo} className="btn-primary">
              <GoogleCheckIcon />
              {user ? "Go to your library" : "Sign in with Google — it's free"}
            </Link>
            <a href="#explore" className="btn-secondary">
              Browse first →
            </a>
          </div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="footer-left">
          <span style={{ color: "var(--accent)", fontSize: 18 }}>·</span>
          ReCodenize
          <span style={{ color: "var(--border-hi)" }}>—</span>
          <span>The library for how you code with AI</span>
        </div>
        <div className="footer-right">© 2026 ReCodenize</div>
      </footer>
    </div>
  );
};

export default Landing;
