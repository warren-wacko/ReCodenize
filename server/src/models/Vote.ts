import { Schema, model, Types } from "mongoose";

const voteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    promptId: { type: Types.ObjectId, ref: "Prompt", required: true },
  },
  { timestamps: true },
);

voteSchema.index({ userId: 1, promptId: 1 }, { unique: true });
voteSchema.index({ promptId: 1 });

export const VoteModel = model("Vote", voteSchema);
