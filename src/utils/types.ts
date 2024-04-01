export enum ResourceType {
    RootFile = "RootFile",
    Java = "Java",
    ForgeModRequired = "ForgeModRequired",
    ForgeModOptional = "ForgeModOptional",
    ForgeCoreRequired = "ForgeCoreRequired",
    ForgeCoreOptional = "ForgeCoreOptional",
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