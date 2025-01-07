namespace secure_cloud_api.Core.Services.DTOs;

public class GetSharedFileDto
{
    public Guid Id { get; set; }
    public Guid FileId { get; set; }
    public string SharedWithUserId { get; set; }
    public DateTime SharedAt { get; set; }
}
