import { Hono } from "hono";
import { cors } from "hono/cors";

import auth from "./routes/auth";
import scaffolds from "./routes/scaffolds";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "https://scaffold-track.lucio-peraza54.workers.dev",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (c) => {
  return c.json({
    message: "ScaffoldTrack API running",
  });
});

app.route("/api/auth", auth);
app.route("/api/scaffolds", scaffolds);

export default app;
