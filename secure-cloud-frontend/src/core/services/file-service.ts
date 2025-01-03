import axios from "axios";
import {UploadFileDTO} from "@/core/dtos/uploadFileDTO.ts";

export class FileService {

  api = axios.create({
    baseURL: `http://localhost:9090/api`
  });

  //TODO GetSharedFiles (how to do that?)

  getFileById = async (id: string) => {
    try{
      const response = await this.api.get(`/file/files/${id}`);
      return response.data;
    }catch (error){
      console.error('Error getting file by id:', error, '\n', 'ID: ', id);
      return null;
    }
  }

  getAllFiles = async () => {
    try{
      const response = await this.api.get(`/file/files/`);
      return response.data;
    }catch (error){
      console.error('Error getting all files: ', error);
      return null;
    }
  }

  uploadFile = async (dto: UploadFileDTO) => {
    try{
      const response = await this.api.post('/file/uploadFile', dto);
      return response.data;
    }catch (error){
      console.error('Error uploading file:', error);
      return null;
    }
  }

  deleteFile = async (id: string) => {
    try{
      const response = await this.api.delete(`/file/delete/${id}`);
      return response.data;
    }catch (error){
      console.error('Error deleting file:', error);
      return null;
    }
  }


}