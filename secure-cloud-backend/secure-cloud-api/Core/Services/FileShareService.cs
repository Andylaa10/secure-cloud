using AutoMapper;
using secure_cloud_api.Core.Repositories.Interfaces;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;
using FileShare = secure_cloud_api.Core.Entities.FileShare;

namespace secure_cloud_api.Core.Services;

public class FileShareService : IFileShareService
{
    private readonly IFileShareRepository _shareFileShareRepository;
    private readonly IMapper _mapper;

    public FileShareService(IFileShareRepository fileShareRepository, IMapper mapper)
    {
        _shareFileShareRepository = fileShareRepository;
        _mapper = mapper;
    }

    public async Task<Dictionary<string, GetFileDto>> GetAllSharedFilesByUserId(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID cannot be null or empty");
        try
        {
            var keysGetFileDto = new Dictionary<string, GetFileDto>();
            var keysFiles = await _shareFileShareRepository.GetAllSharedFilesByUserId(userId);

            foreach (var key in keysFiles)
            {
                if (!keysGetFileDto.TryAdd(key.Key, _mapper.Map<GetFileDto>(key.Value)))
                {
                    Console.WriteLine($"Duplicate key detected: {key.Key}");
                }
            }

            return keysGetFileDto;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error processing files: {e.Message}");
            throw new ArgumentException($"Error processing files: {e.Message}");
        }
    }

    public async Task<IEnumerable<FileShare>> GetUsersOnSharedFile(Guid fileId)
    {
        if (fileId == Guid.Empty)
            throw new ArgumentException("File ID cannot be empty");

        try
        {
            var sharedUsers = await _shareFileShareRepository.GetUsersOnSharedFile(fileId);
            return _mapper.Map<IEnumerable<FileShare>>(sharedUsers);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    public async Task ShareFile(CreateSharedFileDto dto)
    {
        try
        {
            await _shareFileShareRepository.ShareFile(_mapper.Map<FileShare>(dto));
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    public async Task RemoveUserFromFile(Guid sharedWithUserId, Guid sharedFileId)
    {
        if (sharedFileId == Guid.Empty)
            throw new ArgumentException("Shared File ID cannot be empty");

        try
        {
            await _shareFileShareRepository.RemoveUserFromFile(sharedFileId, sharedFileId);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }
}
