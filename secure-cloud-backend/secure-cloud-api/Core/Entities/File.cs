using System.Reflection.Metadata;

namespace secure_cloud_api.Core.Entities;

public class File
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string ContentType { get; set; }
    public string Content { get; set; } //TODO Byte[]
    public DateTime CreatedAt { get; set; }
}