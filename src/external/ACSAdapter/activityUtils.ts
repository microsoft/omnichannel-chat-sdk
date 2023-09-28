export const getDataURL = async (file: File): Promise<string | ArrayBuffer> => {
    return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            resolve((fileReader as any).result); // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        fileReader.readAsDataURL(file);
    });
}

export const getAttachments = async (files: File[]): Promise<Array<any>> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return Promise.all(
        files.map(async (file: File) => {
            if (file) {
                const url = await getDataURL(file);
                return {
                    contentType: file.type,
                    contentUrl: url,
                    name: file.name,
                    thumbnailUrl: file.type.match("(image|video|audio).*") ? url: undefined
                }
            }
        })
    )
}

export const getAttachmentSizes = (files: File[]): number[] => {
    return files.map((file: File) => {
        return file.size;
    });
}

export default {getDataURL, getAttachments, getAttachmentSizes};