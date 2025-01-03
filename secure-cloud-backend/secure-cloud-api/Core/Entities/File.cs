using System.Reflection.Metadata;

namespace secure_cloud_api.Core.Entities;

public class File
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public Byte[] Content { get; set; } 
    public string ContentType { get; set; }
    public string OwnerId { get; set; }
    public string Key { get; set; }
    public DateTime CreatedAt { get; set; }
}