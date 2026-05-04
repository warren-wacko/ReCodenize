import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";
import type { PromptDetail } from "./usePrompt";

type VoteResponse = { voted: boolean; upvoteCount: number };

type ExploreCache = { pages: Prompt[][]; pageParams: number[] };

const flipPrompt = (p: Prompt): Prompt => {
  const wasVoted = p.hasVoted ?? false;
  return {
    ...p,
    hasVoted: !wasVoted,
    upvoteCount: Math.max(0, p.upvoteCount + (wasVoted ? -1 : 1)),
  };
};

const setPrompt = (
  p: Prompt,
  voted: boolean,
  upvoteCount: number,
): Prompt => ({ ...p, hasVoted: voted, upvoteCount });

export function useVote(promptId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      api<VoteResponse>(`/api/prompts/${promptId}/vote`, { method: "POST" }),

    // Optimistic flip — runs the moment the user clicks
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: ["prompts", "trending"] }),
        qc.cancelQueries({ queryKey: ["prompts", "explore"] }),
        qc.cancelQueries({ queryKey: ["prompt", promptId] }),
      ]);

      const prevTrending = qc.getQueryData<Prompt[]>(["prompts", "trending"]);
      const prevDetail = qc.getQueryData<PromptDetail>(["prompt", promptId]);

      qc.setQueryData<Prompt[]>(["prompts", "trending"], (data) =>
        data?.map((p) => (p._id === promptId ? flipPrompt(p) : p)),
      );

      qc.setQueriesData<ExploreCache>(
        { queryKey: ["prompts", "explore"] },
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) =>
              page.map((p) => (p._id === promptId ? flipPrompt(p) : p)),
            ),
          };
        },
      );

      qc.setQueryData<PromptDetail>(["prompt", promptId], (data) =>
        data
          ? {
              ...data,
              hasVoted: !data.hasVoted,
              prompt: {
                ...data.prompt,
                upvoteCount: Math.max(
                  0,
                  data.prompt.upvoteCount + (data.hasVoted ? -1 : 1),
                ),
              },
            }
          : data,
      );

      return { prevTrending, prevDetail };
    },

    onError: (_err, _vars, ctx) => {
      // Roll back to pre-mutation snapshot
      if (ctx?.prevTrending !== undefined)
        qc.setQueryData(["prompts", "trending"], ctx.prevTrending);
      if (ctx?.prevDetail !== undefined)
        qc.setQueryData(["prompt", promptId], ctx.prevDetail);
      // Explore is page-shaped; refetch to recover
      qc.invalidateQueries({ queryKey: ["prompts", "explore"] });
    },

    onSuccess: (res) => {
      // Sync to server truth
      qc.setQueryData<Prompt[]>(["prompts", "trending"], (data) =>
        data?.map((p) =>
          p._id === promptId ? setPrompt(p, res.voted, res.upvoteCount) : p,
        ),
      );

      qc.setQueriesData<ExploreCache>(
        { queryKey: ["prompts", "explore"] },
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) =>
              page.map((p) =>
                p._id === promptId
                  ? setPrompt(p, res.voted, res.upvoteCount)
                  : p,
              ),
            ),
          };
        },
      );

      qc.setQueryData<PromptDetail>(["prompt", promptId], (data) =>
        data
          ? {
              ...data,
              hasVoted: res.voted,
              prompt: { ...data.prompt, upvoteCount: res.upvoteCount },
            }
          : data,
      );
    },
  });
}
