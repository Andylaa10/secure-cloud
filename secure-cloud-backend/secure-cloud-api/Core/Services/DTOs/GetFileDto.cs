namespace secure_cloud_api.Core.Services.DTOs;

public class GetFileDto
{
    public Guid id { get; set; }
    public string Name { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
}