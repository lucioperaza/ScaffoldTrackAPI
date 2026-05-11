import { Hono } from "hono";
import auth from "./routes/auth";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "ScaffoldTrack API running",
  });
});

app.route("/api/auth", auth);

export default app;
