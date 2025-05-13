import {immutable, StorageClient} from "@lens-chain/storage-client";
import {thirdwebLensTestnet} from "../constants";

export const uploadMediaToGrove = async (file: File) => {
    if (!file) {
        throw new Error("File is required");
    }
    const storageClient = StorageClient.create();

    const acl = immutable(
        thirdwebLensTestnet.id
    );

    return await storageClient.uploadFile(file, {acl});

}

export const uploadMetadataToGrove = async (metadata: object) => {
    if (!metadata) {
        throw new Error("Metadata is required");
    }
    const storageClient = StorageClient.create();

    const acl = immutable(
        thirdwebLensTestnet.id
    );

    return await storageClient.uploadAsJson(metadata, {acl});
}
