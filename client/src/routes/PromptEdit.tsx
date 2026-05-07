import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { usePrompt } from "../hooks/usePrompt";
import { useUpdatePrompt } from "../hooks/useUpdatePrompt";
import { PromptEditor } from "../components/PromptEditor";
import { Button } from "../components/ui/button";

const PromptEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePrompt(id!);
  const prompt = data?.prompt;
  const updatePrompt = useUpdatePrompt();

  if (isLoading) {
    return (
      <div
        className="max-w-3xl mx-auto p-8"
        style={{ color: "var(--lp-text-mid)" }}
      >
        Loading…
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="mb-4" style={{ color: "var(--lp-text-mid)" }}>
          Prompt not found.
        </p>
        <Link to="/library">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PromptEditor
      eyebrow="Edit"
      headline="Edit prompt"
      initialValues={{
        title: prompt.title,
        body: prompt.body,
        description: prompt.description ?? "",
        tool: prompt.tool,
        taskType: prompt.taskType,
        stack: prompt.stack,
        isPublic: prompt.isPublic,
      }}
      submitting={updatePrompt.isPending}
      submitLabel={{
        idle: "Save changes",
        publish: "Save & publish",
        saving: "Saving…",
      }}
      onSubmit={async (values) => {
        try {
          await updatePrompt.mutateAsync({
            id: prompt._id,
            data: {
              ...values,
              description: values.description || undefined,
            },
          });
          toast.success("Prompt updated");
          navigate("/library");
        } catch {
          // Global mutationCache.onError toasts the failure
        }
      }}
    />
  );
};

export default PromptEdit;
