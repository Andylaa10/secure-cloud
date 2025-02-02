import axios from "axios";
import {UploadFileDTO} from "@/core/dtos/uploadFileDTO.ts";
import {File} from "@/core/models/file.model.ts";

export class FileService {

  api = axios.create({
    baseURL: `http://localhost:9090/api`
  });

  getAllFilesByOwnerId = async (accessToken: string): Promise<Map<string, File> | null> => {
    try {
      const response = await this.api.get<Map<string, File>>(`/file/getByOwnerId`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      return response.data;
    }catch (error) {
      console.error('Error getting files:', error);
      return null;
    }
  }

  getFileById = async (accessToken: string, id: string) => {
    try{
      const response = await this.api.get(`/file/files/${id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      return response.data;
    }catch (error){
      console.error('Error getting file by id:', error, '\n', 'ID: ', id);
      return null;
    }
  }

  getAllFiles = async (accessToken: string) => {
    try{
      const response = await this.api.get(`/file/files/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      return response.data;
    }catch (error){
      console.error('Error getting all files: ', error);
      return null;
    }
  }

  uploadFile = async (accessToken: string, dto: UploadFileDTO): Promise<{message: string, file: File} | null> => {
    try{
      const response = await this.api.post('/file/uploadFile', dto, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      return response.data;
    }catch (error){
      console.error('Error uploading file:', error);
      return null;
    }
  }

  deleteFile = async (accessToken: string, id: string) => {
    try{
      const response = await this.api.delete(`/file/deleteFile/${id}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      return response.data;
    }catch (error){
      console.error('Error deleting file:', error);
      return null;
    }
  }


}
