import { create } from "zustand";
import type { Tool, TaskType } from "../lib/types";

export type ExploreSort = "top" | "new" | "copied";

type FiltersState = {
  tool: Tool | "all";
  taskType: TaskType | "all";
  search: string;
  sort: ExploreSort;
  setTool: (t: Tool | "all") => void;
  setTaskType: (t: TaskType | "all") => void;
  setSearch: (q: string) => void;
  setSort: (s: ExploreSort) => void;
  reset: () => void;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  tool: "all",
  taskType: "all",
  search: "",
  sort: "top",
  setTool: (tool) => set({ tool }),
  setTaskType: (taskType) => set({ taskType }),
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  reset: () => set({ tool: "all", taskType: "all", search: "", sort: "top" }),
}));
