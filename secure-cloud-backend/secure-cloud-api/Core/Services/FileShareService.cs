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

    public async Task<IEnumerable<GetFileShareDto>> GetAllSharedFilesByUserId(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID cannot be null or empty");

        try
        {
            var sharedFiles = await _shareFileShareRepository.GetAllSharedFilesByUserId(userId);
            return _mapper.Map<IEnumerable<GetFileShareDto>>(sharedFiles);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
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
