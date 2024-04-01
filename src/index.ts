import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./utils/env.js";
import { getResources } from "./utils/files.js";
import { compressJava } from "./utils/java.js";
import { getMaintenanceState } from "./utils/maintenance.js";

const app = fastify()

await app.register(fastifyStatic, {
    root: env.ROOT,
    prefix: "/distro/"
})

app.get("/build/distribution.json", async (req, res) => {
    const resources = await getResources(process.env.ROOT!)
    const maintenanceState = getMaintenanceState()

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

compressJava()

app.listen({ port: 3001, host: "::" }, () => console.log("Listening on port 3001"))