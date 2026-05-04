import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";

export const PROMPTS_PAGE_SIZE = 12;

export type LibraryView = "all" | "public" | "private";
export type LibrarySort = "recent" | "votes" | "copies";

type Filters = {
  view?: LibraryView;
  sort?: LibrarySort;
  q?: string;
};

export function useMyPrompts(filters: Filters = {}) {
  return useInfiniteQuery({
    queryKey: ["prompts", "me", filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", String(PROMPTS_PAGE_SIZE));
      if (filters.view && filters.view !== "all")
        params.set("view", filters.view);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.q) params.set("q", filters.q);
      return api<{ prompts: Prompt[] }>(`/api/prompts/me?${params}`).then(
        (d) => d.prompts,
      );
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PROMPTS_PAGE_SIZE ? allPages.length : undefined,
  });
}

export type MyStats = {
  total: number;
  public: number;
  private: number;
  upvotes: number;
  copies: number;
};

export function useMyStats() {
  return useQuery({
    queryKey: ["prompts", "me", "stats"],
    queryFn: () => api<MyStats>("/api/prompts/me/stats"),
  });
}
