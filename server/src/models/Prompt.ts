import { Schema, model, Types, type InferSchemaType } from "mongoose";

export const TOOLS = [
  "cursor",
  "claude-code",
  "copilot",
  "chatgpt",
  "aider",
  "other",
] as const;
export const TASK_TYPES = [
  "refactor",
  "scaffold",
  "debug",
  "test",
  "review",
  "explain",
  "rules",
  "other",
] as const;

const promptSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 20_000 },
    description: { type: String, default: "", maxlength: 1000 },
    tool: { type: String, enum: TOOLS, required: true },
    taskType: { type: String, enum: TASK_TYPES, required: true },
    stack: { type: [String], default: [] },
    isPublic: { type: Boolean, default: false },
    upvoteCount: { type: Number, default: 0 },
    copyCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

promptSchema.index({ isPublic: 1, upvoteCount: -1 });
promptSchema.index({ tool: 1, isPublic: 1 });
promptSchema.index({ userId: 1, createdAt: -1 });

export type Prompt = InferSchemaType<typeof promptSchema>;
export const PromptModel = model("Prompt", promptSchema);
