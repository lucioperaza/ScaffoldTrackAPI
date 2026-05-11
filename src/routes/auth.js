import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { getDb } from "../data/db.js";
import { users } from "../data/schema.js";

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

export default auth;
