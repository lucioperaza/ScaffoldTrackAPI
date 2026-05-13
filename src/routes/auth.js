import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { getDb } from "../data/db.js";
import { users } from "../data/schema.js";
import { eq } from "drizzle-orm";
import { createAccessToken } from "../utils/auth.js";
import { sign } from "hono/jwt";

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

  return c.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

export default auth;
