import { z } from "zod"

export const maintenanceSchema = z.object({
    active: z.boolean(),
    playersAllowed: z.array(
        z.object({
            name: z.string(),
            uuid: z.string()
        })
    )
})

export type MainteanceSchema = z.infer<typeof maintenanceSchema>