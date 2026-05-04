import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";

export function useTrending() {
  return useQuery({
    queryKey: ["prompts", "trending"],
    queryFn: () =>
      api<{ prompts: Prompt[] }>("/api/prompts/trending").then(
        (d) => d.prompts,
      ),
    staleTime: 5 * 60_000, // trending is stable for a few minutes
  });
}
