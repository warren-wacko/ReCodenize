import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";

export type PromptAuthor = {
  _id: string;
  name: string;
  avatarUrl: string;
};

export type PromptDetail = {
  prompt: Prompt;
  author: PromptAuthor;
  hasVoted: boolean;
};

export function usePrompt(id: string) {
  return useQuery({
    queryKey: ["prompt", id],
    queryFn: () => api<PromptDetail>(`/api/prompts/${id}`),
    enabled: !!id,
  });
}
