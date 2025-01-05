using System;

namespace secure_cloud_api.Core.Services.DTOs;

public class CreateFileDto
{
    public string Name { get; set; }
    public Byte[] Content { get; set; }
    public string ContentType { get; set; }
    public string OwnerDisplayName { get; set; }
    public string OwnerId { get; set; }
    public string Key { get; set; }
    public string IV { get; set; }
}