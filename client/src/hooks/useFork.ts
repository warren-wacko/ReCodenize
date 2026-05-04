import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";

export function useFork(promptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ prompt: Prompt }>(`/api/prompts/${promptId}/fork`, {
        method: "POST",
      }).then((d) => d.prompt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prompts"] }),
  });
}
