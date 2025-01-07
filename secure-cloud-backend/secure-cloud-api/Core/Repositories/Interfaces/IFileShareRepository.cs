using FileShare = secure_cloud_api.Core.Entities.FileShare;

namespace secure_cloud_api.Core.Repositories.Interfaces;

public interface IFileShareRepository
{
    Task<IEnumerable<FileShare>> GetAllSharedFilesByUserId(string userId);
    Task<IEnumerable<FileShare>> GetUsersOnSharedFile(Guid fileId);
    Task ShareFile(FileShare sharedFile);
    Task RemoveUserFromFile(Guid sharedWithUserId, Guid sharedFileId);
}