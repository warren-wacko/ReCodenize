import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Prompt } from "../lib/types";
import type { ExploreSort } from "../stores/filters";

export const EXPLORE_PAGE_SIZE = 12;

type ExploreFilters = {
  tool?: string;
  taskType?: string;
  q?: string;
  sort?: ExploreSort;
};

export function useExplore(filters: ExploreFilters) {
  return useInfiniteQuery({
    queryKey: ["prompts", "explore", filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (filters.tool && filters.tool !== "all")
        params.set("tool", filters.tool);
      if (filters.taskType && filters.taskType !== "all")
        params.set("taskType", filters.taskType);
      if (filters.q) params.set("q", filters.q);
      if (filters.sort) params.set("sort", filters.sort);
      params.set("page", String(pageParam));
      params.set("limit", String(EXPLORE_PAGE_SIZE));
      return api<{ prompts: Prompt[] }>(
        `/api/prompts/explore?${params}`,
      ).then((d) => d.prompts);
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === EXPLORE_PAGE_SIZE ? allPages.length : undefined,
  });
}
