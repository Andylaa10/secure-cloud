export interface File {
    id: string;
    name: string;
    content: string | Uint8Array;
    contentType: string;
    ownerDisplayName: string;
    ownerId: string;
    key: string;
    createdAt: Date;
    iv: string;
}

