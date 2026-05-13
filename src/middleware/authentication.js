import { verifyAccessToken } from "../utils/auth.js";

export async function authMiddleware(c, next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Missing or invalid Authorization header",
      },
      401,
    );
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token, c.env.JWT_SECRET);

    c.set("user", payload);

    await next();
  } catch {
    return c.json(
      {
        error: "Invalid or expired access token",
      },
      401,
    );
  }
}
