import fs from "node:fs";
import path from "path";
import { maintenanceSchema } from "./schemas.js";

export function getMaintenanceState() {
    const maintenanceRaw = fs.readFileSync(path.join("src", "data", "maintenance.json"), "utf-8");

    const content = JSON.parse(maintenanceRaw);

    const data = maintenanceSchema.parse(content)

    return data;
}