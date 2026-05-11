import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "ScaffoldTrack API running",
  });
});

export default app;
