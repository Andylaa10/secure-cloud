using File = secure_cloud_api.Core.Entities.File;
namespace secure_cloud_api.Core.Repositories.Interfaces;

public interface IFileRepository
{
    public Task<File> GetAllFiles(string id); //TODO
    public Task<File> GetFileById(string id); //TODO
    public Task<File> GetSharedFiles(string id); //TODO
    public Task<File> AddFile(File file);
    public Task<File> DeleteFile(string id);
    public Task RebuildDatabase();
}