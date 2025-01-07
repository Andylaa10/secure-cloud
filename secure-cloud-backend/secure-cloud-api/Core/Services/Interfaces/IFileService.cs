using secure_cloud_api.Core.Services.DTOs;

namespace secure_cloud_api.Core.Services.Interfaces;

public interface IFileService
{
    public Task<Dictionary<string, GetFileDto>> GetAllFilesByOwnerId(Guid ownerId);
    public Task<GetFileDto> GetFileById(Guid id);
    public Task<GetFileDto> AddFile(CreateFileDto dto);
    public Task<GetFileDto> DeleteFile(Guid id);
    public Task RebuildDatabase();
}