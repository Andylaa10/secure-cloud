namespace secure_cloud_api.Core.Repositories.Interfaces;

public interface IFileRepository
{
    public Task<Dictionary<string, File>> GetAllFilesByOwnerId(Guid ownerId);
    public Task<File> GetFileById(Guid id);
    public Task<File> AddFile(File file);
    public Task<File> DeleteFile(Guid id);
    public Task RebuildDatabase();
}