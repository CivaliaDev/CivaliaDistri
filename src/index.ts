import { Hono } from "hono";
import fs from "node:fs";
import path from "node:path";
import { ZodError } from "zod";
import distributionApp from "./routes/distribution.js";
import { env } from "./utils/env.js";
import { cacheResources, fetchResources } from "./utils/files.js";
import { compressJava } from "./utils/java.js";
import { isRunningOnBun } from "./utils/runtime.js";

const { serveStatic } = isRunningOnBun() ? await import("hono/bun") : await import("@hono/node-server/serve-static")
const { serve } = isRunningOnBun()? await import("bun") : await import("@hono/node-server")

process.on("uncaughtException", (error) => {
    if (error.message.startsWith("ENOENT:")) {
        fetchResources(env.ROOT).then(cacheResources)
        return
    };

    throw error;
})

const app = new Hono()
    .route("/", distributionApp)

const root = path.relative(process.cwd(), env.ROOT)

if (root.startsWith("..")) throw new Error("Root path is not relative")

app.use('/distro/*', serveStatic({
    root,
    rewriteRequestPath: (p) => p.replace("/distro", "")
}))

app.onError((err, c) => {
    c.status(500)

    const response = {
        statusCode: 500,
        error: "Error",
        message: err.message
    }

    if (response instanceof ZodError) {
        response.error
        response.message = JSON.stringify(response.message)
    }

    return c.json(response)
})

let watchTimeout: Timer | null = null;

fs.watch(env.ROOT, { recursive: true }, (event, filename) => {
    if (watchTimeout) {
        clearTimeout(watchTimeout)
        watchTimeout = null
    }

    watchTimeout = setTimeout(async () => {
        console.log("[ResourcesManager] Regenerating cache")

        const resources = await fetchResources(env.ROOT)

        cacheResources(resources)
    }, 500)
})

fetchResources(env.ROOT).then(cacheResources)

compressJava()

const honoConfig = {
    port: Number(process.env.PORT) || 3001,
    fetch: app.fetch
}

serve(honoConfig)

console.log(`Listening on port ${honoConfig.port}`)

export type AppType = typeof app;