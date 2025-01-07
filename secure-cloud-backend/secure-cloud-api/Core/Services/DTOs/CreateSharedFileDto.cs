namespace secure_cloud_api.Core.Services.DTOs;

public class CreateSharedFileDto
{
    public string FileId { get; set; }
    public string SharedWithUserId { get; set; }
    public string OwnerDisplayName { get; set; }
    public string EncryptedKey { get; set; }
}