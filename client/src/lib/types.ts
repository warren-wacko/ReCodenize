export type Tool =
  | "cursor"
  | "claude-code"
  | "copilot"
  | "chatgpt"
  | "aider"
  | "other";
export type TaskType =
  | "refactor"
  | "scaffold"
  | "debug"
  | "test"
  | "review"
  | "explain"
  | "rules"
  | "other";

export type User = {
  _id: string;
  email: string;
  name: string;
  avatarUrl: string;
};

export type PromptAuthor = {
  _id: string;
  name: string;
  avatarUrl: string;
};

export type Prompt = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  description?: string;
  tool: Tool;
  taskType: TaskType;
  stack: string[];
  isPublic: boolean;
  upvoteCount: number;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
  author?: PromptAuthor; // populated on Explore + Trending; absent on Library
  hasVoted?: boolean; // populated on Explore + Trending when authenticated
};
