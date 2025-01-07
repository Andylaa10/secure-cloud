namespace secure_cloud_api.Core.Services.DTOs;

public class CreateSharedFileDto
{
    public Guid FileId { get; set; }
    public string SharedWithUserId { get; set; }
}
