import { config } from "dotenv"
import { z } from "zod"

config()

const envSchema = z.object({
    BASE_URL: z.string(),
    FORGE: z.string(),
    ROOT: z.string(),
    JAVA: z.string()
})

export const env = Object.entries(envSchema.parse(process.env)).reduce((acc, [key, value]) => ({ ...acc, [key]: value.replace(/"(.*)"/, "$1") }), {} as z.infer<typeof envSchema>)