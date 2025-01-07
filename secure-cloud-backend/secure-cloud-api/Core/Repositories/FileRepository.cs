using Microsoft.EntityFrameworkCore;
using secure_cloud_api.Core.Helpers;
using secure_cloud_api.Core.Repositories.Interfaces;

namespace secure_cloud_api.Core.Repositories;

public class FileRepository : IFileRepository
{
    private readonly DatabaseContext _context;

    public FileRepository(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<string, File>> GetAllFilesByOwnerId(Guid ownerId)
    {
        var keysFiles = new Dictionary<string, File>();

        var files = await _context.Files
            .Where(file => file.OwnerId == ownerId.ToString())
            .ToListAsync();

        var sharedFiles = await _context.SharedFiles
            .Where(s => files.Select(f => f.Id).Contains(s.FileId))
            .ToListAsync();

        var fileKeyMap = sharedFiles.ToDictionary(s => s.FileId, s => s.EncryptedKey);

        foreach (var file in files)
        {
            if (fileKeyMap.TryGetValue(file.Id, out var encryptedKey))
            {
                keysFiles.TryAdd(encryptedKey, file);
            }
        }

        return keysFiles;
    }


    public async Task<File> GetFileById(Guid id)
    {
        var file = await _context.Files.FirstOrDefaultAsync(file => file.Id == id);
        return file ?? throw new FileNotFoundException($"No file found with this guid: {id}");
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