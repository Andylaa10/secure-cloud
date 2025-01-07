export interface FileShare{
    id: string;
    fileId: string;
    sharedWithUserId: string;
    ownerDisplayName: string;
    sharedAt: Date;
    encryptedKey: string;
}
