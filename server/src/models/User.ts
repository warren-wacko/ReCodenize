import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = model("User", userSchema);
