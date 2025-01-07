import axios from "axios";
import {CreateSharedFileDto} from "@/core/dtos/CreateSharedFileDto.ts";
import {SharedFile} from "@/core/models/shared-file.model.ts";

export class SharedFileService {

    api = axios.create({
        baseURL: `http://localhost:9090/api`
    });

    /**
     * Get all files shared with a specific user.
     * @param userId - ID of the user
     * @returns Promise with an array of SharedFile
     */
    async getAllSharedFilesByUserId(userId: string): Promise<SharedFile[]> {
        const response = await this.api.get<SharedFile[]>(`/user/${userId}`);
        return response.data;
    }

    /**
     * Get all users a file is shared with.
     * @param fileId - ID of the file
     * @returns Promise with an array of SharedFile
     */
    async getSharedUsersByFileId(fileId: string): Promise<SharedFile[]> {
        const response = await this.api.get<SharedFile[]>(`/file/${fileId}/users`);
        return response.data;
    }

    /**
     * Share a file with a user.
     * @param dto - CreateSharedFileDto containing fileId and userId
     * @returns Promise with the newly created SharedFile
     */
    async shareFile(dto: CreateSharedFileDto): Promise<SharedFile> {
        const response = await this.api.post<SharedFile>("/", dto);
        return response.data;
    }

    /**
     * Unshare a file from a specific user.
     * @param sharedFileId - ID of the shared file relation
     * @returns Promise with the unshared SharedFile
     */
    async unshareFile(sharedFileId: string): Promise<SharedFile> {
        const response = await this.api.delete<SharedFile>(`/${sharedFileId}`);
        return response.data;
    }
}