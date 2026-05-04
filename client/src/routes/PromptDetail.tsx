import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, Copy, GitFork } from "lucide-react";
import { toast } from "sonner";
import { usePrompt } from "../hooks/usePrompt";
import { useVote } from "../hooks/useVote";
import { useFork } from "../hooks/useFork";
import { useAuthStore } from "../stores/auth";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";

const TOOL_LABELS: Record<string, string> = {
  cursor: "Cursor",
  "claude-code": "Claude Code",
  copilot: "Copilot",
  chatgpt: "ChatGPT",
  aider: "Aider",
  other: "Other",
};

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error } = usePrompt(id!);
  const vote = useVote(id!);
  const fork = useFork(id!);

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-muted-foreground mb-4">Prompt not found.</p>
        <Link to="/explore">
          <Button variant="outline">Back to explore</Button>
        </Link>
      </div>
    );
  }

  const { prompt, author, hasVoted } = data;
  const isOwner = user?._id === author._id;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body);
      toast.success("Copied to clipboard");
      api(`/api/prompts/${prompt._id}/copy`, { method: "POST" }).catch(() => {
        // fire-and-forget — don't block UX on counter
      });
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleVote = () => {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    vote.mutate();
  };

  const handleFork = () => {
    if (!user) {
      toast.error("Sign in to fork");
      return;
    }
    fork.mutate(undefined, {
      onSuccess: (forked) => {
        toast.success("Forked to your library");
        navigate(`/library/${forked._id}/edit`);
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pt-8 sm:pt-10">
      <div className="mb-6">
        <Link to="/explore">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to explore
          </Button>
        </Link>
      </div>

      <span
        className={`tool-tag tool-tag-${prompt.tool} mb-4 inline-flex`}
      >
        {TOOL_LABELS[prompt.tool] ?? prompt.tool}
        <span style={{ opacity: 0.6, fontWeight: 300 }}>
          / {prompt.taskType}
        </span>
      </span>

      <h1 className="section-headline mb-3">{prompt.title}</h1>

      {prompt.description && (
        <p
          className="text-[16px] mb-6 max-w-prose"
          style={{ color: "var(--lp-text-mid)" }}
        >
          {prompt.description}
        </p>
      )}

      <div className="flex items-center gap-3 mb-6">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className="text-[13px]"
          style={{ color: "var(--lp-text-mid)" }}
        >
          by{" "}
          <span style={{ color: "var(--lp-text)" }}>{author.name}</span>
        </span>
      </div>

      {prompt.stack.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-8">
          {prompt.stack.map((s) => (
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
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button onClick={handleCopy} className="gap-2">
          <Copy className="w-4 h-4" />
          Copy prompt
        </Button>

        {user && (
          <Button
            variant={hasVoted ? "default" : "outline"}
            onClick={handleVote}
            disabled={vote.isPending}
            className="gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            {hasVoted ? "Upvoted" : "Upvote"} · {prompt.upvoteCount}
          </Button>
        )}

        {user && !isOwner && (
          <Button
            variant="outline"
            onClick={handleFork}
            disabled={fork.isPending}
            className="gap-2"
          >
            <GitFork className="w-4 h-4" />
            {fork.isPending ? "Forking..." : "Fork to my library"}
          </Button>
        )}
      </div>

      <pre
        className="text-[13px] leading-[1.65] rounded-[10px] p-5 whitespace-pre-wrap break-words overflow-x-auto border"
        style={{
          fontFamily: "var(--font-mono)",
          background: "var(--lp-bg2)",
          borderColor: "var(--lp-border)",
          color: "var(--lp-text)",
        }}
      >
        {prompt.body}
      </pre>
    </div>
  );
};

export default PromptDetail;
