import { Link } from "react-router-dom";
import { Lock, Globe, ArrowUp, Trash2 } from "lucide-react";
import type { Prompt } from "../lib/types";
import { toast } from "sonner";
import { useDeletePrompt } from "../hooks/useDeletePrompt";
import { Button } from "./ui/button";

export function DeletePromptButton({ id }: { id: string }) {
  const deletePrompt = useDeletePrompt();

  const handleDelete = async () => {
    if (!confirm("Delete this prompt?")) return;
    try {
      await deletePrompt.mutateAsync(id);
      toast.success("Prompt deleted");
    } catch {
      // Global mutationCache.onError toasts the failure
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deletePrompt.isPending}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

const TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  copilot: "Copilot",
  chatgpt: "ChatGPT",
  aider: "Aider",
  other: "Other",
};

type PromptCardProps = {
  prompt: Prompt;
  actions?: React.ReactNode;
  showVisibility?: boolean; // show lock/globe icon — useful in /library, not in /explore
  href?: string; // override default link target
};

export function PromptCard({
  prompt,
  actions,
  showVisibility = false,
  href,
}: PromptCardProps) {
  const linkTo = href ?? `/p/${prompt._id}`;
  const toolTagClass = `tool-tag tool-tag-${prompt.tool}`;

  return (
    <article
      className="rounded-[10px] border bg-card transition-[border-color,transform] duration-200 hover:-translate-y-px"
      style={{ borderColor: "var(--lp-border)" }}
    >
      <div className="px-4 sm:px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={toolTagClass}>
            {TOOL_LABELS[prompt.tool] ?? prompt.tool}
            <span style={{ opacity: 0.6, fontWeight: 300 }}>
              / {prompt.taskType}
            </span>
          </span>
          {showVisibility && (
            <span
              className="text-[var(--lp-text-dim)] shrink-0"
              title={prompt.isPublic ? "Public" : "Private"}
            >
              {prompt.isPublic ? (
                <Globe className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>

        <Link to={linkTo} className="block group">
          <h3 className="font-medium text-[15px] leading-tight truncate group-hover:underline">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="text-[13px] text-[var(--lp-text-mid)] line-clamp-2 mt-1.5">
              {prompt.description}
            </p>
          )}
        </Link>
      </div>

      <Link to={linkTo} className="block px-4 sm:px-5 pb-3">
        <pre
          className="text-[11px] leading-[1.55] line-clamp-3 overflow-hidden whitespace-pre-wrap break-words"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--lp-text-dim)",
          }}
        >
          {prompt.body}
        </pre>
      </Link>

      <footer
        className="flex items-center justify-between gap-2 flex-wrap px-4 sm:px-5 py-3 border-t"
        style={{ borderColor: "var(--lp-border)" }}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          {prompt.stack.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded border"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--lp-text-mid)",
                borderColor: "var(--lp-border)",
              }}
            >
              {s}
            </span>
          ))}
          {prompt.stack.length > 3 && (
            <span
              className="text-[10px]"
              style={{ color: "var(--lp-text-dim)" }}
            >
              +{prompt.stack.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {prompt.isPublic && (
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--lp-text-dim)",
              }}
              title="Upvotes"
            >
              <ArrowUp className="w-3 h-3" />
              {prompt.upvoteCount}
            </span>
          )}
          {actions}
        </div>
      </footer>
    </article>
  );
}
