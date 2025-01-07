using SharedFile = secure_cloud_api.Core.Entities.SharedFile;
namespace secure_cloud_api.Core.Repositories.Interfaces;

public interface ISharedFileRepository
{
    Task<IEnumerable<SharedFile>> GetAllSharedFilesByUserId(string userId);
    Task<IEnumerable<SharedFile>> GetSharedUsersByFileId(Guid fileId);
    Task<SharedFile> ShareFile(SharedFile sharedFile);
    Task<SharedFile> UnshareFile(Guid sharedFileId);
}