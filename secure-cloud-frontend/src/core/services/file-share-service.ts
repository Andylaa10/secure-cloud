import axios from "axios";
import {File} from "@/core/models/file.model.ts";
import {ShareFileDTO} from "@/core/dtos/shareFileDTO.ts";

export class FileShareService {
    api = axios.create({
        baseURL: `http://localhost:9090/api`
    });

    /**
     * Returns a list of the files that is shared with the user
     * @param userId
     * @param accessToken
     */
    async getAllSharedFilesByUserId(userId: string, accessToken: string): Promise<Map<string, File>> {
        const response = await this.api.get<Map<string, File>>(`FileShare/user/${userId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        return response.data;
    }

    /**
     * Returns a list of usernames on shared file
     * @param fileId
     * @param accessToken
     */
    async getUsersOnSharedFile(fileId: string, accessToken: string): Promise<string[]> {
        const response = await this.api.get<string[]>(`FileShare/file/${fileId}/users`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        return response.data;
    }


    async shareFile(dto: ShareFileDTO, accessToken: string): Promise<void> {
        const response = await this.api.post(`FileShare`, dto, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        return response.data;
    }


    //TODO
    async removeUserFromFile(sharedWithUserId: string, sharedFileId: string, accessToken: string): Promise<void> {
        const response = await this.api.delete(`FileShare/${sharedWithUserId}/${sharedFileId}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })

        return response.data;
    }
}
