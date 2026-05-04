import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";

export function useCreatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Prompt>) =>
      api<{ prompt: Prompt }>("/api/prompts", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((d) => d.prompt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts"] }),
  });
}
