using Microsoft.EntityFrameworkCore;
using secure_cloud_api.Core.Helpers;
using secure_cloud_api.Core.Repositories.Interfaces;
using FileShare = secure_cloud_api.Core.Entities.FileShare;

namespace secure_cloud_api.Core.Repositories;

public class FileShareRepository : IFileShareRepository
{
    private readonly DatabaseContext _context;

    public FileShareRepository(DatabaseContext context)
    {
        _context = context;
    }

    // Get all shared files for a specific user
    public async Task<Dictionary<string, File>> GetAllSharedFilesByUserId(string userId)
    {
        var keysFiles = new Dictionary<string, File>();

        var files = await _context.Files
            .ToListAsync();

        var fileshares = await _context.SharedFiles
            .Where(sharedFile => sharedFile.SharedWithUserId == userId)
            .Include(sf => sf.File)
            .ToListAsync();

        var fileKeyMap = fileshares.ToDictionary(s => s.FileId, s => s.EncryptedKey);

        foreach (var file in files)
        {
            if (fileKeyMap.TryGetValue(file.Id, out var encryptedKey))
            {
                if (!keysFiles.TryAdd(encryptedKey, file))
                {
                    Console.WriteLine($"Duplicate encrypted key detected: {encryptedKey}");
                }
            }
        }

        return keysFiles;
    }

    // Get all users a file is shared with
    public async Task<List<string>> GetUsersOnSharedFile(Guid fileId)
    {
        var usernames = _context.SharedFiles.Where(f => f.FileId == fileId).Select(f => f.SharedWithUserDisplayName).ToListAsync();

        return await usernames;
    }

    // Share a file with a user
    public async Task ShareFile(FileShare sharedFile)
    {
        await _context.SharedFiles.AddAsync(sharedFile);
        await _context.SaveChangesAsync();
    }

    // Remove a shared file from a user
    public async Task RemoveUserFromFile(Guid sharedWithUserId, Guid sharedFileId)
    {
        // Validate parameters
        if (sharedWithUserId == Guid.Empty || sharedFileId == Guid.Empty)
        {
            throw new ArgumentException("Invalid user ID or file ID.");
        }

        // Fetch the shared file record
        var sharedFile = await _context.SharedFiles
            .FirstOrDefaultAsync(sf => sf.SharedWithUserId == sharedWithUserId.ToString() && sf.FileId == sharedFileId);

        // Handle the case where the record is not found
        if (sharedFile == null)
        {
            throw new KeyNotFoundException($"No shared file found with id: {sharedFileId} for user: {sharedWithUserId}");
        }

        // Remove the record and save changes
        _context.SharedFiles.Remove(sharedFile);
        await _context.SaveChangesAsync();
    }
}
