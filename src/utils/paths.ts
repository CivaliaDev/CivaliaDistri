import path from "path";
import { env } from "./env.js";

export function rootDir() {
    return env.ROOT;
}

export function runtimesDir() {
    return path.join(rootDir(), "runtimes")
}