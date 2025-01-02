using AutoMapper;
using secure_cloud_api.Core.Services.DTOs;
using File = secure_cloud_api.Core.Entities.File;

namespace secure_cloud_api.Configs;

public class AutoMapperConfig
{
    public static IMapper ConfigureAutoMapper()
    {
        var mapper = new MapperConfiguration(options =>
        {
            // DTO to Entity
            options.CreateMap<CreateFileDto, File>();
            
            // Entity to DTO
            options.CreateMap<File, GetFileDto>();
            
        }).CreateMapper();

        return mapper;
    }
}