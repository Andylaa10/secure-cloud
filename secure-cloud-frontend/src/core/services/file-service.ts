import axios from "axios";
import {UploadFileDTO} from "@/core/dtos/uploadFileDTO.ts";

export class FileService {

  api = axios.create({
    baseURL: `http://localhost:9090/api`
  });

  //TODO GetSharedFiles (how to do that?)

  getAllFilesByOwnerId = async (accessToken: string) => {
    try {
      const response = await this.api.get(`/file/getByOwnerId`, {
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

  uploadFile = async (accessToken: string, dto: UploadFileDTO) => {
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
      const response = await this.api.delete(`/file/delete/${id}`, {
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
