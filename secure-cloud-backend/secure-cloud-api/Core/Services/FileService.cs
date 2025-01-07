using AutoMapper;
using secure_cloud_api.Core.Repositories.Interfaces;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Core.Services;

public class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;
    private readonly IMapper _mapper;

    public FileService(IFileRepository fileRepository, IMapper mapper)
    {
        _fileRepository = fileRepository;
        _mapper = mapper;
    }

    public async Task<Dictionary<string, GetFileDto>> GetAllFilesByOwnerId(Guid ownerId)
    {
        try
        {
            var keysGetFileDto = new Dictionary<string, GetFileDto>();
            
            var keysFiles = await _fileRepository.GetAllFilesByOwnerId(ownerId);

            foreach (var key in keysFiles)
            {
                keysGetFileDto.Add(key.Key, _mapper.Map<GetFileDto>(key.Value));
            }
            
            return keysGetFileDto;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }

    public async Task<GetFileDto> GetFileById(Guid id)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id can't be empty");

        try
        {
            var file = _mapper.Map<GetFileDto>(await _fileRepository.GetFileById(id));
            return file;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }

    }

    public async Task<GetFileDto> AddFile(CreateFileDto dto)
    {
        try
        {

            var file = _mapper.Map<GetFileDto>(await _fileRepository.AddFile(_mapper.Map<File>(dto)));
            return file;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.ToString());
        }
    }

    public async Task<GetFileDto> DeleteFile(Guid id)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id can't be empty");

        try
        {
            var file = _mapper.Map<GetFileDto>(await _fileRepository.DeleteFile(id));
            return file;
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }

    }

    public async Task RebuildDatabase()
    {
        try
        {
            await _fileRepository.RebuildDatabase();
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.ToString());
        }
    }
}