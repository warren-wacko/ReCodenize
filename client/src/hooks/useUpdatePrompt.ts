import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";

type UpdatePromptInput = {
  id: string;
  data: Partial<Prompt>;
};

export function useUpdatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdatePromptInput) =>
      api<{ prompt: Prompt }>(`/api/prompts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }).then((d) => d.prompt),
    onSuccess: (prompt) => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
      qc.invalidateQueries({ queryKey: ["prompt", prompt._id] });
    },
  });
}
