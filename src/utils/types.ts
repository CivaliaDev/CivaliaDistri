export enum ResourceType {
    RootFile = "RootFile",
    Java = "Java",
    ForgeModOptional = "ForgeModOptional",
    ForgeMod = "ForgeMod",
    ForgeCore = "ForgeCore",
    RessourcePack = "RessourcePack",
    ShaderPack = "ShaderPack",
    ConfigElement = "ConfigElement",
    Unknown = "Unknown"
}

export type Artifact = {
    size: number,
    url: string,
    md5: string,
    extension: string
}

export type Resource = {
    id: string,
    name: string,
    type: ResourceType,
    artifact: Artifact
}