import {File} from "@/core/models/file.model.ts";

export interface SharedFile {
    id: string;
    fileId: string;
    file: File;
    sharedWithUserId: string;
    SharedAt: Date;
}
