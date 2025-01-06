using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using secure_cloud_api.Core.Repositories.Interfaces;
using secure_cloud_api.Core.Services.DTOs;
using secure_cloud_api.Core.Services.Interfaces;
using File = secure_cloud_api.Core.Entities.File;

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

    public async Task<IEnumerable<GetFileDto>> GetAllFilesByOwnerId(Guid ownerId)
    {
        try
        {
            var files = await _fileRepository.GetAllFilesByOwnerId(ownerId);
            return _mapper.Map<IEnumerable<GetFileDto>>(files);
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
    
    public Task<IEnumerable<GetFileDto>> GetSharedFiles(Guid id)
    {
        throw new NotImplementedException(); //TODO 
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