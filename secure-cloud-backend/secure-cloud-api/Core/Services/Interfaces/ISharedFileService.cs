using secure_cloud_api.Core.Services.DTOs;

namespace secure_cloud_api.Core.Services.Interfaces;

public interface ISharedFileService
{
    Task<IEnumerable<GetSharedFileDto>> GetAllSharedFilesByUserId(string userId);
    Task<IEnumerable<GetSharedUserDto>> GetSharedUsersByFileId(Guid fileId);
    Task<GetSharedFileDto> ShareFile(CreateSharedFileDto dto);
    Task<GetSharedFileDto> UnshareFile(Guid sharedFileId);
}