import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  CLIENT_URL: z
    .string()
    .url()
    .transform((url) => url.replace(/\/$/, "")),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid env vars:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
