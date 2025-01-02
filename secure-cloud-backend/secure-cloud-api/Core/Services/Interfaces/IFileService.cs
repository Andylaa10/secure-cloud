using secure_cloud_api.Core.Services.DTOs;

namespace secure_cloud_api.Core.Services.Interfaces;

public interface IFileService
{
    public Task<IEnumerable<GetFileDto>> GetAllFiles(string id); //TODO
    public Task<GetFileDto> GetFileById(string id); //TODO
    public Task<IEnumerable<GetFileDto>> GetSharedFiles(string id); //TODO
    public Task<CreateFileDto> AddFile(CreateFileDto file);
    public Task<GetFileDto> DeleteFile(string id);
    public Task RebuildDatabase();
}