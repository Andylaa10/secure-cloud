namespace secure_cloud_api.Core.Services.DTOs;

public class GetFileShareDto
{
    public Guid Id { get; set; }
    public Guid FileId { get; set; }
    public string SharedWithUserId { get; set; }
    public string OwnerDisplayName { get; set; }
    public DateTime SharedAt { get; set; }
    public string EncryptedKey { get; set; }
}
