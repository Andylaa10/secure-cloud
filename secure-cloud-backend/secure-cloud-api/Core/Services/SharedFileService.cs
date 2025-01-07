using AutoMapper;
using secure_cloud_api.Core.Entities;
using secure_cloud_api.Core.Repositories.Interfaces;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Core.Services;

public class SharedFileService : ISharedFileService
{
    private readonly IShareFileRepository _shareFileRepository;
    private readonly IMapper _mapper;

    public SharedFileService(IShareFileRepository shareFileRepository, IMapper mapper)
    {
        _shareFileRepository = shareFileRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<GetSharedFileDto>> GetAllSharedFilesByUserId(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("User ID cannot be null or empty");

        try
        {
            var sharedFiles = await _shareFileRepository.GetAllSharedFilesByUserId(userId);
            return _mapper.Map<IEnumerable<GetSharedFileDto>>(sharedFiles);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    public async Task<IEnumerable<GetSharedUserDto>> GetSharedUsersByFileId(Guid fileId)
    {
        if (fileId == Guid.Empty)
            throw new ArgumentException("File ID cannot be empty");

        try
        {
            var sharedUsers = await _shareFileRepository.GetSharedUsersByFileId(fileId);
            return _mapper.Map<IEnumerable<GetSharedUserDto>>(sharedUsers);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    public async Task<GetSharedFileDto> ShareFile(CreateSharedFileDto dto)
    {
        try
        {
            var sharedFile = await _shareFileRepository.ShareFile(_mapper.Map<SharedFile>(dto));
            return _mapper.Map<GetSharedFileDto>(sharedFile);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    public async Task<GetSharedFileDto> UnshareFile(Guid sharedFileId)
    {
        if (sharedFileId == Guid.Empty)
            throw new ArgumentException("Shared File ID cannot be empty");

        try
        {
            var unsharedFile = await _shareFileRepository.UnshareFile(sharedFileId);
            return _mapper.Map<GetSharedFileDto>(unsharedFile);
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }
}
