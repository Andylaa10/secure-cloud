namespace secure_cloud_api.Core.Services.DTOs;

public class GetFileDto
{
    public int id { get; set; }
    public string Name { get; set; }
    public Byte[] Content { get; set; }
    public DateTime CreatedAt { get; set; }
}