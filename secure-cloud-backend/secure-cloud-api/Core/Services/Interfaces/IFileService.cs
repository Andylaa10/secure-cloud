using secure_cloud_api.Core.Services.DTOs;

namespace secure_cloud_api.Core.Services.Interfaces;

public interface IFileService
{
    public Task<IEnumerable<GetFileDto>> GetAllFilesByOwnerId(Guid ownerId); //TODO
    public Task<GetFileDto> GetFileById(Guid id); //TODO
    public Task<IEnumerable<GetFileDto>> GetSharedFiles(Guid id); //TODO
    public Task<GetFileDto> AddFile(CreateFileDto dto);
    public Task<GetFileDto> DeleteFile(Guid id);
    public Task RebuildDatabase();
}