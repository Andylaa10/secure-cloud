using FileShare = secure_cloud_api.Core.Entities.FileShare;

namespace secure_cloud_api.Core.Repositories.Interfaces;

public interface IFileShareRepository
{
    Task<Dictionary<string, File>> GetAllSharedFilesByUserId(string userId);
    Task<List<string>> GetUsersOnSharedFile(Guid fileId);
    Task ShareFile(FileShare sharedFile);
    Task RemoveUserFromFile(Guid sharedWithUserId, Guid sharedFileId);
}