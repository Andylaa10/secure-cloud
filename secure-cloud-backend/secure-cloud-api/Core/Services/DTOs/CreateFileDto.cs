namespace secure_cloud_api.Core.Services.DTOs;

public class CreateFileDto
{
    public string Name { get; set; }
    public Byte[] Content { get; set; }
    public string ContentType { get; set; }
    public string OwnerId { get; set; }
    public string Key { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}