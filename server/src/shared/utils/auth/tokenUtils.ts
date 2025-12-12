import jwt from "jsonwebtoken";
import redisClient from "@/infra/cache/redis";

export function generateAccessToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "24h",
  });
}

export function generateRefreshToken(id: string, absExp?: number) {
  const absoluteExpiration = absExp || Math.floor(Date.now() / 1000) + 604800;
  const ttl = absoluteExpiration - Math.floor(Date.now() / 1000);

  return jwt.sign(
    { id, absExp: absoluteExpiration },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: ttl,
    }
  );
}

export const blacklistToken = async (
  token: string,
  ttl: number
): Promise<void> => {
  await redisClient.set(`blacklist:${token}`, "blacklisted", "EX", ttl);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  } catch (error) {
    console.error("Redis error:", error);
    return false;
  }
};
