using secure_cloud_api.Core.Services.DTOs;
using FileShare = secure_cloud_api.Core.Entities.FileShare;

namespace secure_cloud_api.Core.Services.Interfaces;

public interface IFileShareService
{
    Task<IEnumerable<GetFileShareDto>> GetAllSharedFilesByUserId(string userId);
    Task<IEnumerable<FileShare>> GetUsersOnSharedFile(Guid fileId);
    Task ShareFile(CreateSharedFileDto dto);
    Task RemoveUserFromFile(Guid sharedWithUserId, Guid sharedFileId);}