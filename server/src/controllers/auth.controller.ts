import type { Request, Response } from "express";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { verifyGoogleIdToken } from "../lib/google.js";
import { signJwt } from "../lib/jwt.js";
import { ApiError } from "../middleware/errorHandler.js";

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function googleAuth(req: Request, res: Response) {
  const { idToken } = req.body;
  const profile = await verifyGoogleIdToken(idToken);

  const user = await UserModel.findOneAndUpdate(
    { googleId: profile.googleId },
    { $set: profile },
    { upsert: true, new: true },
  );

  const token = signJwt(user._id.toString());
  res.cookie("token", token, cookieOptions);
  res.json({ user });
}

export async function getMe(req: Request, res: Response) {
  const user = await UserModel.findById(req.userId).lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", cookieOptions);
  res.json({ ok: true });
}
