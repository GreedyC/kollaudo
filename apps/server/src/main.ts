import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 8080);

serve({ fetch: createApp().fetch, port }, (info) => {
  console.log(`Kollaudo listening on http://localhost:${info.port}`);
});
