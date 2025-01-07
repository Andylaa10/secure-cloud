using Microsoft.EntityFrameworkCore;
using secure_cloud_api.Core.Entities;
using secure_cloud_api.Core.Helpers;
using secure_cloud_api.Core.Repositories.Interfaces;

namespace secure_cloud_api.Core.Repositories;

public class SharedFileRepository : ISharedFileRepository
{
    private readonly DatabaseContext _context;

    public SharedFileRepository(DatabaseContext context)
    {
        _context = context;
    }

    // Get all shared files for a specific user
    public async Task<IEnumerable<SharedFile>> GetAllSharedFilesByUserId(string userId)
    {
        return await _context.SharedFiles
            .Where(sharedFile => sharedFile.SharedWithUserId == userId)
            .Include(sf => sf.File)
            .ToListAsync();
    }

    // Get all users a file is shared with
    public async Task<IEnumerable<SharedFile>> GetSharedUsersByFileId(Guid fileId)
    {
        return await _context.SharedFiles
            .Where(sharedFile => sharedFile.FileId == fileId)
            .ToListAsync();
    }

    // Share a file with a user
    public async Task<SharedFile> ShareFile(SharedFile sharedFile)
    {
        await _context.SharedFiles.AddAsync(sharedFile);
        await _context.SaveChangesAsync();
        return sharedFile;
    }

    // Remove a shared file from a user
    public async Task<SharedFile> UnshareFile(Guid sharedFileId)
    {
        var sharedFile = await _context.SharedFiles.FirstOrDefaultAsync(sf => sf.Id == sharedFileId);

        if (sharedFile == null)
        {
            throw new KeyNotFoundException($"No shared file found with id: {sharedFileId}");
        }

        _context.SharedFiles.Remove(sharedFile);
        await _context.SaveChangesAsync();

        return sharedFile;
    }
}
