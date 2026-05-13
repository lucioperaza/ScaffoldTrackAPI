import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { getDb } from "../data/db.js";
import { users } from "../data/schema.js";
import { refreshTokens } from "../data/schema.js";
import { eq } from "drizzle-orm";
import { createAccessToken, createRefreshToken } from "../utils/auth.js";
import { sign } from "hono/jwt";
import { verifyAccessToken } from "../utils/auth.js";

const auth = new Hono();

auth.get("/", (c) => {
  return c.json({
    message: "Auth route working",
  });
});

auth.post("/register", async (c) => {
  try {
    const db = getDb(c.env.DB);

    const body = await c.req.json();

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = {
      email: body.email,
      passwordHash: hashedPassword,
    };

    await db.insert(users).values(newUser);

    return c.json({
      message: "User registered successfully",
    });
  } catch (error) {
    return c.json(
      {
        error: "Email already exists",
      },
      409,
    );
  }
});

auth.post("/login", async (c) => {
  const db = getDb(c.env.DB);

  const body = await c.req.json();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email));

  const user = result[0];

  if (!user) {
    return c.json(
      {
        error: "Invalid email or password",
      },
      401,
    );
  }

  const passwordMatch = await bcrypt.compare(body.password, user.passwordHash);

  if (!passwordMatch) {
    return c.json(
      {
        error: "Invalid email or password",
      },
      401,
    );
  }
  const accessToken = await createAccessToken(
    {
      userId: user.id,
      email: user.email,
    },
    c.env.JWT_SECRET,
  );
  const refreshToken = await createRefreshToken(
    {
      userId: user.id,
      email: user.email,
    },
    c.env.JWT_SECRET,
  );
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,

    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),

    createdAt: new Date().toISOString(),
  });

  return c.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

auth.post("/refresh", async (c) => {
  const db = getDb(c.env.DB);

  const body = await c.req.json();

  const refreshToken = body.refreshToken;

  if (!refreshToken) {
    return c.json(
      {
        error: "Refresh token required",
      },
      401,
    );
  }

  try {
    const payload = await verifyAccessToken(refreshToken, c.env.JWT_SECRET);

    const storedToken = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));

    if (!storedToken.length) {
      return c.json(
        {
          error: "Invalid refresh token",
        },
        401,
      );
    }

    const newAccessToken = await createAccessToken(
      {
        userId: payload.userId,
        email: payload.email,
      },
      c.env.JWT_SECRET,
    );

    return c.json({
      accessToken: newAccessToken,
    });
  } catch {
    return c.json(
      {
        error: "Invalid or expired refresh token",
      },
      401,
    );
  }
});

auth.post("/logout", async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();
  const refreshToken = body.refreshToken;

  if (!refreshToken) {
    return c.json(
      {
        error: "Refresh token required",
      },
      400,
    );
  }

  await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));

  return c.json({
    message: "Logged out successfully",
  });
});
export default auth;
