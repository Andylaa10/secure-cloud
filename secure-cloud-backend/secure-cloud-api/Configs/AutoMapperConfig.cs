using AutoMapper;
using secure_cloud_api.Configs.Helpers;
using secure_cloud_api.Core.Entities;
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
            options.CreateMap<CreateFileDto, File>()
                .ForMember(f => f.Content, opt => opt.MapFrom<StringToByteArrayResolverContent>())
                .ForMember(f => f.IV, opt => opt.MapFrom<StringToByteArrayResolverIV>());

            options.CreateMap<CreateSharedFileDto, SharedFile>();

            options.CreateMap<GetSharedUserDto, SharedFile>();

            // Entity to DTO
            options.CreateMap<File, GetFileDto>();

            options.CreateMap<SharedFile, GetSharedFileDto>();

            options.CreateMap<SharedFile, GetSharedUserDto>();

        }).CreateMapper();

        return mapper;
    }
}