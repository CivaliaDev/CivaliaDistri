import path from "path";
import { env } from "./env.js";

export function distroDir() {
    return path.join(env.ROOT, "distro");
}

export function runtimesDir() {
    return path.join(distroDir(), "runtimes")
}