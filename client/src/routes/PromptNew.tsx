import { useEffect, useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreatePrompt } from "../hooks/useCreatePrompt";
import { useAuthStore } from "../stores/auth";
import type { Tool, TaskType } from "../lib/types";
import "./PromptNew.css";

const TOOLS: { value: Tool; label: string }[] = [
  { value: "cursor", label: "Cursor" },
  { value: "claude-code", label: "Claude Code" },
  { value: "copilot", label: "Copilot" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "aider", label: "Aider" },
  { value: "other", label: "Other" },
];

const TASKS: { value: TaskType; label: string }[] = [
  { value: "rules", label: "Rules / system" },
  { value: "refactor", label: "Refactor" },
  { value: "scaffold", label: "Scaffold" },
  { value: "debug", label: "Debug" },
  { value: "test", label: "Test" },
  { value: "review", label: "Code review" },
  { value: "explain", label: "Explain" },
  { value: "other", label: "Other" },
];

const TOOL_LABELS: Record<Tool, string> = TOOLS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<Tool, string>,
);

type Template = {
  id: string;
  label: string;
  icon: string;
  title: string;
  body: string;
  tool: Tool;
  taskType: TaskType;
};

const TEMPLATES: Template[] = [
  {
    id: "rules",
    label: "Rules file",
    icon: "▣",
    title: "CLAUDE.md — project rules",
    body: `You are working in this project. Before editing any file:
1. Read the relevant README
2. Check existing patterns in the codebase
3. Run the linter when done

Never make cross-package changes without asking first.`,
    tool: "claude-code",
    taskType: "rules",
  },
  {
    id: "refactor",
    label: "Refactor",
    icon: "↻",
    title: "Refactor pass",
    body: "Review this file and identify any unused variables, dead code branches, or functions that are never called. Explain each removal and ensure nothing is needed for side effects.",
    tool: "cursor",
    taskType: "refactor",
  },
  {
    id: "review",
    label: "Code review",
    icon: "✓",
    title: "Senior engineer review",
    body: `Act as a senior engineer reviewing this PR. Look for:
- Bugs and edge cases
- Performance issues
- Naming clarity
- Test coverage gaps

Be direct. No fluff.`,
    tool: "chatgpt",
    taskType: "review",
  },
  {
    id: "blank",
    label: "Blank",
    icon: "+",
    title: "",
    body: "",
    tool: "cursor",
    taskType: "rules",
  },
];

const STACK_SUGGEST = [
  "typescript",
  "react",
  "next.js",
  "node",
  "python",
  "tailwind",
  "rust",
  "postgres",
  "jest",
  "monorepo",
];

const ArrowL = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path
      d="M8 3L4 7l4 4M4 7h9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
const Lock = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <rect x="2.5" y="5" width="7" height="5.5" rx="1" stroke="currentColor" />
    <path d="M4 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" fill="none" />
  </svg>
);
const X = () => (
  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
    <path
      d="M3 3l6 6M9 3l-6 6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
const Sparkle = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1L7 5L11 6L7 7L6 11L5 7L1 6L5 5L6 1Z"
      fill="currentColor"
    />
  </svg>
);

const TITLE_MAX = 200;
const BODY_MAX = 20_000;

const PromptNew = () => {
  const navigate = useNavigate();
  const createPrompt = useCreatePrompt();
  const user = useAuthStore((s) => s.user);

  const [tplId, setTplId] = useState("blank");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [desc, setDesc] = useState("");
  const [tool, setTool] = useState<Tool>("cursor");
  const [task, setTask] = useState<TaskType>("rules");
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const canSubmit =
    !createPrompt.isPending &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    body.length <= BODY_MAX;

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await createPrompt.mutateAsync({
        title: title.trim(),
        body,
        description: desc.trim() || undefined,
        tool,
        taskType: task,
        stack,
        isPublic,
      });
      toast.success(isPublic ? "Prompt published" : "Prompt saved");
      navigate("/library");
    } catch {
      // Global mutationCache.onError toasts the failure
    }
  }

  // ⌘+S / Ctrl+S to save
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit, title, body, desc, tool, task, stack, isPublic]);

  function applyTemplate(t: Template) {
    setTplId(t.id);
    if (t.id === "blank") {
      setTitle("");
      setBody("");
      return;
    }
    setTitle(t.title);
    setBody(t.body);
    setTool(t.tool);
    setTask(t.taskType);
  }

  function addStack(raw: string) {
    const s = raw.trim().toLowerCase();
    if (s && !stack.includes(s)) setStack([...stack, s]);
    setStackInput("");
  }

  function onStackKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addStack(stackInput);
    } else if (e.key === "Backspace" && !stackInput && stack.length) {
      setStack(stack.slice(0, -1));
    }
  }

  const charCount = body.length;
  const isLong = charCount > BODY_MAX;
  const initial = (user?.name ?? "?").charAt(0).toUpperCase();
  const taskLabel =
    TASKS.find((t) => t.value === task)?.label ?? task;

  return (
    <div className="np-shell">
      <header className="np-header">
        <Link to="/library" className="np-back">
          <ArrowL /> Back to library
        </Link>
        <div className="np-header-r">
          <Link to="/library" className="np-btn-secondary">
            Cancel
          </Link>
          <button
            type="button"
            className="np-btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {createPrompt.isPending
              ? "Saving…"
              : isPublic
                ? "Publish prompt"
                : "Save prompt"}
          </button>
        </div>
      </header>

      <div className="np-title-row">
        <span className="section-tag">New prompt</span>
        <h1 className="np-h1">Add to your library</h1>
      </div>

      <div className="np-tpl-row">
        <span className="np-tpl-label">Start from</span>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`np-tpl ${tplId === t.id ? "active" : ""}`}
            onClick={() => applyTemplate(t)}
          >
            <span className="np-tpl-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="np-grid">
        <div className="np-form">
          <div className="np-field">
            <label className="np-label" htmlFor="np-title">
              <span>Title</span>
              <span className="np-hint">
                {title.length}/{TITLE_MAX}
              </span>
            </label>
            <input
              id="np-title"
              className="np-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cursor rules for Next.js App Router"
              maxLength={TITLE_MAX}
            />
          </div>

          <div className="np-field">
            <label className="np-label" htmlFor="np-body">
              <span>Prompt</span>
              <span
                className="np-hint"
                style={isLong ? { color: "var(--lp-red)" } : undefined}
              >
                {charCount.toLocaleString()} / {BODY_MAX.toLocaleString()}{" "}
                chars
              </span>
            </label>
            <div className="np-code-wrap">
              <div className="np-code-bar">
                <span className="np-code-tag">prompt.md</span>
                <span className="np-code-bar-r">
                  {charCount.toLocaleString()} chars
                </span>
              </div>
              <textarea
                id="np-body"
                className="np-code"
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Paste your prompt, rules file, or context block here…"
              />
            </div>
            {isLong && (
              <span className="np-error">
                Prompt body is too long. Trim it under {BODY_MAX.toLocaleString()} characters.
              </span>
            )}
          </div>

          <div className="np-row-2">
            <div className="np-field">
              <label className="np-label">
                <span>Tool</span>
              </label>
              <div className="np-segment">
                {TOOLS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`np-seg ${tool === t.value ? "active" : ""}`}
                    onClick={() => setTool(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="np-field">
              <label className="np-label">
                <span>Task type</span>
              </label>
              <div className="np-segment">
                {TASKS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`np-seg ${task === t.value ? "active" : ""}`}
                    onClick={() => setTask(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="np-field">
            <label className="np-label" htmlFor="np-desc">
              <span>Description</span>
              <span className="np-hint">
                Optional · helps others know when to use it
              </span>
            </label>
            <textarea
              id="np-desc"
              className="np-input np-textarea"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Why this works, when to use it…"
            />
          </div>

          <div className="np-field">
            <label className="np-label">
              <span>Stack</span>
              <span className="np-hint">Press Enter or , to add</span>
            </label>
            <div
              className="np-tokens"
              onClick={() =>
                document.getElementById("np-stack-input")?.focus()
              }
            >
              {stack.map((s) => (
                <span key={s} className="np-token">
                  {s}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStack(stack.filter((x) => x !== s));
                    }}
                    aria-label={`Remove ${s}`}
                  >
                    <X />
                  </button>
                </span>
              ))}
              <input
                id="np-stack-input"
                className="np-token-input"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={onStackKey}
                placeholder={
                  stack.length ? "" : "nextjs, typescript, tailwind"
                }
              />
            </div>
            <div className="np-suggest">
              {STACK_SUGGEST.filter((s) => !stack.includes(s))
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="np-suggest-chip"
                    onClick={() => addStack(s)}
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          <div className="np-publish">
            <div>
              <div className="np-publish-title">
                {isPublic ? (
                  <>
                    <Globe /> Public on Explore
                  </>
                ) : (
                  <>
                    <Lock /> Private to you
                  </>
                )}
              </div>
              <p className="np-publish-desc">
                {isPublic
                  ? "Anyone can find, copy, and fork this prompt. You'll see upvote and copy counts."
                  : "Only you can see this prompt. You can publish it later from your library."}
              </p>
            </div>
            <button
              type="button"
              className={`np-switch ${isPublic ? "on" : ""}`}
              onClick={() => setIsPublic(!isPublic)}
              aria-label="Toggle public"
              aria-pressed={isPublic}
            >
              <span className="np-switch-thumb" />
            </button>
          </div>
        </div>

        <aside className="np-preview">
          <div className="np-preview-head">
            <Sparkle /> <span>Live preview</span>
          </div>

          <article className="np-card">
            <div className="np-card-head">
              <span className={`tool-tag tool-tag-${tool}`}>
                {TOOL_LABELS[tool]}
                <span style={{ opacity: 0.6, fontWeight: 300 }}>
                  / {task}
                </span>
              </span>
              <span className={`np-vis ${isPublic ? "public" : "private"}`}>
                {isPublic ? (
                  <>
                    <Globe /> Public
                  </>
                ) : (
                  <>
                    <Lock /> Private
                  </>
                )}
              </span>
            </div>
            <h3 className="np-card-title">
              {title || (
                <span className="np-placeholder">Untitled prompt</span>
              )}
            </h3>
            {desc ? (
              <p className="np-card-desc">{desc}</p>
            ) : (
              <p className="np-card-desc np-placeholder">
                Description appears here…
              </p>
            )}
            <pre className="np-card-body">
              {body || (
                <span className="np-placeholder">
                  Your prompt body shows here as a 4-line snippet.
                </span>
              )}
            </pre>
            <div className="np-card-stack">
              {stack.length > 0 ? (
                <>
                  {stack.slice(0, 4).map((s) => (
                    <span key={s} className="np-stack-chip">
                      {s}
                    </span>
                  ))}
                  {stack.length > 4 && (
                    <span className="np-stack-more">
                      +{stack.length - 4}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="np-placeholder"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                >
                  + stack chips
                </span>
              )}
            </div>
            <div className="np-card-foot">
              <span className="np-author">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="np-avatar"
                    referrerPolicy="no-referrer"
                    style={{ background: "transparent" }}
                  />
                ) : (
                  <span className="np-avatar">{initial}</span>
                )}
                <span>{user?.name ?? "you"} · just now</span>
              </span>
              <span className="np-card-actions">↑ 0 · ⎘ 0</span>
            </div>
          </article>

          <div className="np-tips">
            <div className="np-tips-h">Tips for a great prompt</div>
            <ul>
              <li>
                Lead with the role or context ("You are a senior…")
              </li>
              <li>Number your constraints — models obey lists better</li>
              <li>End with the format you want back</li>
              <li>Keep it scannable: under 500 words is usually enough</li>
            </ul>
          </div>

          <div className="np-shortcut">
            <kbd>⌘</kbd>
            <kbd>S</kbd> Save · {taskLabel.toLowerCase()} ·{" "}
            {isPublic ? "public" : "private"}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PromptNew;
