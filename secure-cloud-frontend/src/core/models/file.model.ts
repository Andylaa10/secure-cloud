export interface File {
    id: string;
    name: string;
    content: Uint8Array;
    contentType: string;
    ownerDisplayName: string;
    ownerId: string;
    key: string;
    createdAt: Date;
    iv: Uint8Array;
}

