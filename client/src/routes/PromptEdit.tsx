import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { usePrompt } from "../hooks/usePrompt";
import { useUpdatePrompt } from "../hooks/useUpdatePrompt";
import { PromptForm } from "../components/PromptForm";
import { Button } from "../components/ui/button";

const PromptEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePrompt(id!);
  const prompt = data?.prompt;
  const updatePrompt = useUpdatePrompt();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  if (error || !prompt) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <p className="text-muted-foreground mb-4">Prompt not found.</p>
        <Link to="/library">
          <Button variant="outline">Back to library</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="mb-4">
        <Link to="/library">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to library
          </Button>
        </Link>
      </div>

      <span className="section-tag mb-3">Edit</span>
      <h1 className="section-headline mb-8">Edit prompt</h1>

      <PromptForm
        defaultValues={prompt}
        onSubmit={async (data) => {
          try {
            await updatePrompt.mutateAsync({ id: prompt._id, data });
            toast.success("Prompt updated");
            navigate("/library");
          } catch {
            // Global mutationCache.onError toasts the failure
          }
        }}
        submitting={updatePrompt.isPending}
      />
    </div>
  );
};

export default PromptEdit;
