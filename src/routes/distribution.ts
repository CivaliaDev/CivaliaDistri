import { Hono } from "hono";
import { getResources } from "../utils/files.js";
import { getMaintenanceState } from "../utils/maintenance.js";

export default new Hono()
    .get("/distribution.json", async (c) => {
        const resources = await getResources()
        const maintenanceState = getMaintenanceState()
    
        return c.json({
            maintenance: maintenanceState,
            resources
        })
    })