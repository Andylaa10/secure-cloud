using System;

namespace secure_cloud_api.Core.Services.DTOs;

public class GetFileDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Content { get; set; }
    public string ContentType { get; set; }
    public string OwnerDisplayName { get; set; }
    public string OwnerId { get; set; }
    public string Key { get; set; }
    public DateTime CreatedAt { get; set; }
}