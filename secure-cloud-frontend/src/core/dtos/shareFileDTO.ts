export interface ShareFileDTO {
    fileId: string;
    sharedWithUserId: string;
    ownerDisplayName: string;
    encryptedKey: string;
    sharedWithUserDisplayName: string;
}
