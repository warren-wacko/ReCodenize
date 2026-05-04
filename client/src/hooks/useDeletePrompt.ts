import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useDeletePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<{ ok: true }>(`/api/prompts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["prompts"] });
      qc.removeQueries({ queryKey: ["prompt", id] });
    },
  });
}
