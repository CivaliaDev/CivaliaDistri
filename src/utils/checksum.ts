import _checksum from "checksum"

export default function checksum(file: string) {
    return new Promise<string>((resolve, reject) => {
        _checksum.file(file, (err, hash) => {
            if (err) {
                reject(err)
            } else {
                resolve(hash)
            }
        })
    })
}