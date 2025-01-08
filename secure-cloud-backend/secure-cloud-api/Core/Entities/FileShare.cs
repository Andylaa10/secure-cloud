namespace secure_cloud_api.Core.Entities;

public class FileShare
{
    public Guid Id { get; set; }
    public Guid FileId { get; set; }
    public string SharedWithUserId { get; set; }
    public string OwnerDisplayName { get; set; }
    public string SharedWithUserDisplayName { get; set; }
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
    public string EncryptedKey { get; set; }
    public File? File;
}
