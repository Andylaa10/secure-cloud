using secure_cloud_api.Core.Repositories.Interfaces;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;

namespace secure_cloud_api.Core.Services;

public class FileService : IFileService
{
    private readonly IFileRepository _fileRepository;

    public FileService(IFileRepository fileRepository)
    {
        _fileRepository = fileRepository;
    }

    public Task<IEnumerable<GetFileDto>> GetAllFiles(string id)
    {
        throw new NotImplementedException();
    }

    public Task<GetFileDto> GetFileById(string id)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<GetFileDto>> GetSharedFiles(string id)
    {
        throw new NotImplementedException();
    }

    public Task<CreateFileDto> AddFile(CreateFileDto file)
    {
        throw new NotImplementedException();
    }

    public Task<GetFileDto> DeleteFile(string id)
    {
        throw new NotImplementedException();
    }

    public async Task RebuildDatabase()
    {
        try
        {
            await _fileRepository.RebuildDatabase();
        }
        catch (Exception e)
        {
            throw new ArgumentException(e.Message);
        }
    }
}