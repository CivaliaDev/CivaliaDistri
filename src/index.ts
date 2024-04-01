import fastify from "fastify";
import { ZodError } from "zod";
import { getRessources } from "./utils/files.js";
import { compressJava } from "./utils/java.js";
import { getMaintenanceState } from "./utils/maintenance.js";

const app = fastify()

app.get("/build/distribution.json", async (req, res) => {
    const ressources = await getRessources(process.env.ROOT!)
    const maintenanceState = getMaintenanceState()

    return {
        maintenance: maintenanceState,
        ressources
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