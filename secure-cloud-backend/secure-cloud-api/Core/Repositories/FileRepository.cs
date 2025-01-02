using secure_cloud_api.Core.Helpers;
using secure_cloud_api.Core.Repositories.Interfaces;
using File = secure_cloud_api.Core.Entities.File;

namespace secure_cloud_api.Core.Repositories;

public class FileRepository : IFileRepository
{
    
    private readonly DatabaseContext _context;
    
    public FileRepository(DatabaseContext context)
    {
        _context = context;
    }

    public Task<File> GetAllFiles(string id)
    {
        throw new NotImplementedException();
    }

    public Task<File> GetFileById(string id)
    {
        throw new NotImplementedException();
    }

    public Task<File> GetSharedFiles(string id)
    {
        throw new NotImplementedException();
    }

    public Task<File> AddFile(File file)
    {
        throw new NotImplementedException();
    }

    public Task<File> DeleteFile(string id)
    {
        throw new NotImplementedException();
    }

    public async Task RebuildDatabase()
    {
        await _context.Database.EnsureDeletedAsync();
        await _context.Database.EnsureCreatedAsync();
    }
}