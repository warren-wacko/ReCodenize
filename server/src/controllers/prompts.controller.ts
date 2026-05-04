import type { Request, Response } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { PromptModel, TOOLS, TASK_TYPES } from "../models/Prompt.js";
import { VoteModel } from "../models/Vote.js";
import { ApiError } from "../middleware/errorHandler.js";

export const createPromptSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(20_000),
  description: z.string().max(1000).optional(),
  tool: z.enum(TOOLS),
  taskType: z.enum(TASK_TYPES),
  stack: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export const updatePromptSchema = createPromptSchema.partial();

export async function createPrompt(req: Request, res: Response) {
  const prompt = await PromptModel.create({ ...req.body, userId: req.userId });
  res.status(201).json({ prompt });
}

export const myPromptsQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(50).default(12),
  view: z.enum(["all", "public", "private"]).default("all"),
  sort: z.enum(["recent", "votes", "copies"]).default("recent"),
  q: z.string().optional(),
});

const MY_SORT_ORDERS: Record<
  "recent" | "votes" | "copies",
  Record<string, 1 | -1>
> = {
  recent: { updatedAt: -1, createdAt: -1 },
  votes: { upvoteCount: -1, createdAt: -1 },
  copies: { copyCount: -1, createdAt: -1 },
};

export async function getMyPrompts(req: Request, res: Response) {
  const { page, limit, view, sort, q } = myPromptsQuerySchema.parse(req.query);
  const filter: any = { userId: req.userId };
  if (view === "public") filter.isPublic = true;
  if (view === "private") filter.isPublic = false;
  if (q)
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { body: { $regex: q, $options: "i" } },
    ];

  const prompts = await PromptModel.find(filter)
    .sort(MY_SORT_ORDERS[sort])
    .skip(page * limit)
    .limit(limit)
    .lean();
  res.json({ prompts });
}

export async function getMyStats(req: Request, res: Response) {
  const [agg] = await PromptModel.aggregate<{
    total: number;
    public: number;
    private: number;
    upvotes: number;
    copies: number;
  }>([
    { $match: { userId: new Types.ObjectId(req.userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        public: { $sum: { $cond: ["$isPublic", 1, 0] } },
        private: { $sum: { $cond: ["$isPublic", 0, 1] } },
        upvotes: { $sum: "$upvoteCount" },
        copies: { $sum: "$copyCount" },
      },
    },
  ]);

  res.json(
    agg ?? { total: 0, public: 0, private: 0, upvotes: 0, copies: 0 },
  );
}

export async function getPrompt(req: Request, res: Response) {
  const prompt = await PromptModel.findById(req.params.id)
    .populate("userId", "name avatarUrl")
    .lean();
  if (!prompt) throw new ApiError(404, "Prompt not found");

  const author = prompt.userId as unknown as {
    _id: { toString(): string };
    name: string;
    avatarUrl: string;
  };
  const authorId = author._id.toString();

  if (!prompt.isPublic && authorId !== req.userId) {
    throw new ApiError(404, "Prompt not found");
  }

  let hasVoted = false;
  if (req.userId) {
    hasVoted = !!(await VoteModel.exists({
      userId: req.userId,
      promptId: prompt._id,
    }));
  }

  res.json({
    prompt: { ...prompt, userId: authorId },
    author: { _id: authorId, name: author.name, avatarUrl: author.avatarUrl },
    hasVoted,
  });
}

export async function updatePrompt(req: Request, res: Response) {
  const prompt = await PromptModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: req.body },
    { new: true },
  );
  if (!prompt) throw new ApiError(404, "Prompt not found");
  res.json({ prompt });
}

export async function deletePrompt(req: Request, res: Response) {
  const result = await PromptModel.deleteOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (result.deletedCount === 0) throw new ApiError(404, "Prompt not found");
  res.json({ ok: true });
}

export const exploreQuerySchema = z.object({
  tool: z.enum(TOOLS).optional(),
  taskType: z.enum(TASK_TYPES).optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(["top", "new", "copied"]).default("top"),
});

const SORT_ORDERS: Record<
  "top" | "new" | "copied",
  Record<string, 1 | -1>
> = {
  top: { upvoteCount: -1, createdAt: -1 },
  new: { createdAt: -1 },
  copied: { copyCount: -1, createdAt: -1 },
};

function shapeWithAuthor(prompt: any) {
  const author = prompt.userId;
  if (author && typeof author === "object" && "name" in author) {
    return {
      ...prompt,
      userId: author._id.toString(),
      author: {
        _id: author._id.toString(),
        name: author.name,
        avatarUrl: author.avatarUrl,
      },
    };
  }
  return prompt;
}

async function annotateHasVoted(prompts: any[], userId?: string) {
  if (!userId || prompts.length === 0)
    return prompts.map((p) => ({ ...p, hasVoted: false }));
  const ids = prompts.map((p) => p._id);
  const votes = await VoteModel.find({
    userId,
    promptId: { $in: ids },
  })
    .select("promptId")
    .lean();
  const voted = new Set(votes.map((v) => v.promptId.toString()));
  return prompts.map((p) => ({
    ...p,
    hasVoted: voted.has(p._id.toString()),
  }));
}

export async function getExplore(req: Request, res: Response) {
  const query = exploreQuerySchema.parse(req.query);
  const filter: any = { isPublic: true };
  if (query.tool) filter.tool = query.tool;
  if (query.taskType) filter.taskType = query.taskType;
  if (query.q)
    filter.$or = [
      { title: { $regex: query.q, $options: "i" } },
      { body: { $regex: query.q, $options: "i" } },
    ];

  const docs = await PromptModel.find(filter)
    .sort(SORT_ORDERS[query.sort])
    .skip(query.page * query.limit)
    .limit(query.limit)
    .populate("userId", "name avatarUrl")
    .lean();

  const prompts = await annotateHasVoted(
    docs.map(shapeWithAuthor),
    req.userId,
  );
  res.json({ prompts });
}

export async function getTrending(req: Request, res: Response) {
  const docs = await PromptModel.find({ isPublic: true })
    .sort({ copyCount: -1, upvoteCount: -1 })
    .limit(3)
    .populate("userId", "name avatarUrl")
    .lean();

  const prompts = await annotateHasVoted(
    docs.map(shapeWithAuthor),
    req.userId,
  );
  res.json({ prompts });
}

export async function toggleVote(req: Request, res: Response) {
  const id = req.params.id as string;
  const userId = req.userId!;

  const existing = await VoteModel.findOne({ userId, promptId: id });
  if (existing) {
    await existing.deleteOne();
    const prompt = await PromptModel.findByIdAndUpdate(
      id,
      { $inc: { upvoteCount: -1 } },
      { new: true },
    );
    return res.json({ voted: false, upvoteCount: prompt?.upvoteCount ?? 0 });
  }

  await VoteModel.create({ userId, promptId: id });
  const prompt = await PromptModel.findByIdAndUpdate(
    id,
    { $inc: { upvoteCount: 1 } },
    { new: true },
  );
  res.json({ voted: true, upvoteCount: prompt?.upvoteCount ?? 0 });
}

export async function incrementCopy(req: Request, res: Response) {
  const prompt = await PromptModel.findByIdAndUpdate(
    req.params.id,
    { $inc: { copyCount: 1 } },
    { new: true },
  );
  if (!prompt) throw new ApiError(404, "Prompt not found");
  res.json({ copyCount: prompt.copyCount });
}

export async function forkPrompt(req: Request, res: Response) {
  const original = await PromptModel.findById(req.params.id).lean();
  if (!original || !original.isPublic)
    throw new ApiError(404, "Prompt not found");

  const { _id, userId, upvoteCount, copyCount, createdAt, updatedAt, ...rest } =
    original;
  const forked = await PromptModel.create({
    ...rest,
    userId: req.userId,
    isPublic: false,
    title: `${original.title} (fork)`,
  });
  res.status(201).json({ prompt: forked });
}
