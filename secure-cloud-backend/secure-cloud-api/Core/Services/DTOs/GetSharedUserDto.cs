namespace secure_cloud_api.Core.Services.DTOs;

public class GetSharedUserDto
{
    public Guid Id { get; set; }
    public string SharedWithUserId { get; set; }
    public DateTime SharedAt { get; set; }
}
