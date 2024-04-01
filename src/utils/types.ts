export enum ResourceType {
    RootFile = "RootFile",
    Java = "Java",
    ForgeModOptional = "ForgeModOptional",
    ForgeMod = "ForgeMod",
    ForgeVersion = "ForgeVersion",
    RessourcePack = "RessourcePack",
    ShaderPack = "ShaderPack",
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