import { Hono } from "hono";
import auth from "./routes/auth";
import scaffolds from "./routes/scaffolds";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "ScaffoldTrack API running",
  });
});

app.route("/api/auth", auth);
app.route("/api/scaffolds", scaffolds);

export default app;
