namespace secure_cloud_api.Core.Services.DTOs;

public class CreateFileDto
{
    public string Name { get; set; }
    public string Content { get; set; } //TODO Byte[]
    public string ContentType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}