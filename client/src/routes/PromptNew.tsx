import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreatePrompt } from "../hooks/useCreatePrompt";
import {
  PromptEditor,
  type PromptTemplate,
} from "../components/PromptEditor";

const TEMPLATES: PromptTemplate[] = [
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

const PromptNew = () => {
  const navigate = useNavigate();
  const createPrompt = useCreatePrompt();

  return (
    <PromptEditor
      eyebrow="New prompt"
      headline="Add to your library"
      templates={TEMPLATES}
      submitting={createPrompt.isPending}
      submitLabel={{
        idle: "Save prompt",
        publish: "Publish prompt",
        saving: "Saving…",
      }}
      onSubmit={async (values) => {
        try {
          await createPrompt.mutateAsync({
            ...values,
            description: values.description || undefined,
          });
          toast.success(values.isPublic ? "Prompt published" : "Prompt saved");
          navigate("/library");
        } catch {
          // Global mutationCache.onError toasts the failure
        }
      }}
    />
  );
};

export default PromptNew;
