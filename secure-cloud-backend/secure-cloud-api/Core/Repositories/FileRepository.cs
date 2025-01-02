using Microsoft.EntityFrameworkCore;
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

    public async Task<IEnumerable<File>> GetAllFiles()
    {
        return await _context.Files.ToListAsync();
    }

    public async Task<File> GetFileById(Guid id)
    {
        var file = await _context.Files.FirstOrDefaultAsync(file => file.Id == id);
        return file ?? throw new FileNotFoundException($"No file found with this guid: {id}");
    }

    public Task<File> GetSharedFiles(Guid id)
    {
        throw new NotImplementedException(); // TODO 
    }

    public async Task<File> AddFile(File file)
    {
        await _context.Files.AddAsync(file);
        await _context.SaveChangesAsync();

        return file;
    }

    public async Task<File> DeleteFile(Guid id)
    {
        var file = await GetFileById(id);
        _context.Files.Remove(file);
        await _context.SaveChangesAsync();
        return file;
    }

    public async Task RebuildDatabase()
    {
        await _context.Database.EnsureDeletedAsync();
        await _context.Database.EnsureCreatedAsync();
    }
}