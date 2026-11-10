import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { closePrisma } from "./db.js";

const port = Number(process.env.PORT ?? 4002);

const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`JobFinder backend listening on http://localhost:${info.port}`);
});

async function shutdown(): Promise<void> {
  console.log("Shutting down…");
  void server.close();
  await closePrisma();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
