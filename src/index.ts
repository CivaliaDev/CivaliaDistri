import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import fs from "node:fs";
import { ZodError } from "zod";
import { env } from "./utils/env.js";
import { cacheResources, fetchResources, getResources } from "./utils/files.js";
import { compressJava } from "./utils/java.js";
import { getMaintenanceState } from "./utils/maintenance.js";

const app = fastify()

await app.register(fastifyStatic, {
    root: env.ROOT,
    prefix: "/distro/"
})

app.get("/distribution.json", async (req, res) => {
    console.time("get /distribution.json " + req.id)

    const resources = await getResources()
    const maintenanceState = getMaintenanceState()

    console.timeEnd("get /distribution.json " + req.id)

    return {
        maintenance: maintenanceState,
        resources
    }
})

app.setErrorHandler((error, req, res) => {
    if (error instanceof ZodError) {
        throw {
            statusCode: 500,
            error: "ZodError",
            message: JSON.parse(error.message)
        }
    }

    throw error
})

let watchTimeout: NodeJS.Timeout | null = null;

fs.watch(env.ROOT, { recursive: true }, (event, filename) => {
    if (watchTimeout) {
        clearTimeout(watchTimeout)
        watchTimeout = null
    }

    watchTimeout = setTimeout(async () => {
        console.log("[ResourcesManager] Regenerating cache")

        const resources = await fetchResources(process.env.ROOT!)
        
        cacheResources(resources)
    }, 500)
})

compressJava()

app.listen({ port: 3001, host: "::" }, () => console.log("Listening on port 3001"))