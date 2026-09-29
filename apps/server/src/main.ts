#!/usr/bin/env node
import { serve } from "@hono/node-server";
import { HELP, runAdmin } from "./admin/run.ts";
import { createApp } from "./app.ts";
import { createDb, migrateDb } from "./db/client.ts";

const args = process.argv.slice(2);

// Exit quietly when the output is piped to a command that stops reading, such as `head`.
process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

if (args.includes("--help") || args.includes("-h")) {
  process.stdout.write(HELP);
  process.exit(0);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  process.stderr.write("DATABASE_URL is not set. See kollaudo-server --help.\n");
  process.exit(1);
}

const { db, close } = createDb(databaseUrl);
await migrateDb(db);

if (args.length === 0 || args[0] === "serve") {
  const port = Number(process.env.PORT ?? 8080);
  serve({ fetch: createApp().fetch, port }, (info) => {
    console.log(`Kollaudo listening on http://localhost:${info.port}`);
  });
} else {
  process.exitCode = await runAdmin(args, db, {
    out: (text) => process.stdout.write(text),
    err: (text) => process.stderr.write(text),
  });
  await close();
}
