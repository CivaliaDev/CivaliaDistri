import { config } from "dotenv"
import { z } from "zod"

config()

const envSchema = z.object({
    BASE_URL: z.string(),
    FORGE: z.string(),
    ROOT: z.string(),
    JAVA: z.string()
})

export const env = envSchema.parse(process.env)