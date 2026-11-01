import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "@knownva/shared";

export interface AccessPayload {
  sub: number;
  role: Role;
}

export function signAccessToken(payload: AccessPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_TTL as NonNullable<SignOptions["expiresIn"]>,
    issuer: "knownva",
    audience: "knownva-web",
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "knownva",
    audience: "knownva-web",
  });
  if (
    typeof decoded === "string" ||
    !decoded ||
    typeof (decoded as { sub?: unknown }).sub !== "number"
  ) {
    throw new Error("Invalid token payload");
  }
  return {
    sub: (decoded as unknown as { sub: number }).sub,
    role: (decoded as { role: Role }).role,
  };
}
