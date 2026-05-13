import { sign, verify } from "hono/jwt";

export async function createAccessToken(payload, secret) {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
    },
    secret,
  );
}
export async function createRefreshToken(payload, secret) {
  return await sign(
    {
      ...payload,

      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    },
    secret,
  );
}

export async function verifyAccessToken(token, secret) {
  return await verify(token, secret, "HS256");
}
