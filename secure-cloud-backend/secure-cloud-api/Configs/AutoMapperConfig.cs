using AutoMapper;
using secure_cloud_api.Configs.Helpers;
using secure_cloud_api.Core.Services.DTOs;
using FileShare = secure_cloud_api.Core.Entities.FileShare;

namespace secure_cloud_api.Configs;

public class AutoMapperConfig
{
    public static IMapper ConfigureAutoMapper()
    {
        var mapper = new MapperConfiguration(options =>
        {
            // DTO to Entity
            options.CreateMap<CreateFileDto, File>()
                .ForMember(f => f.Content, opt => opt.MapFrom<StringToByteArrayResolverContent>())
                .ForMember(f => f.IV, opt => opt.MapFrom<StringToByteArrayResolverIV>());

            options.CreateMap<CreateSharedFileDto, FileShare>();
            
            // Entity to DTO
            options.CreateMap<File, GetFileDto>();

            options.CreateMap<FileShare, GetFileShareDto>();


        }).CreateMapper();

        return mapper;
    }
}