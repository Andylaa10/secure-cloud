using AutoMapper;
using secure_cloud_api.Core.Services.DTOs;
using File = secure_cloud_api.Core.Entities.File;

namespace secure_cloud_api.Configs.Helpers;

public class StringToByteArrayResolverContent : IValueResolver<CreateFileDto, File, byte[]>
{
    public byte[] Resolve(CreateFileDto source, File destination, byte[] member, ResolutionContext context)
    {
        return Convert.FromBase64String(source.Content); 
    }
}
public class StringToByteArrayResolverIV : IValueResolver<CreateFileDto, File, byte[]>
{
    public byte[] Resolve(CreateFileDto source, File destination, byte[] member, ResolutionContext context)
    {
        return Convert.FromBase64String(source.IV); 
    }
}