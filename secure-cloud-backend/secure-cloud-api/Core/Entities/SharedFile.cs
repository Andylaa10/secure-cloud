using System;

namespace secure_cloud_api.Core.Entities;

public class SharedFile
{
    public Guid Id { get; set; }
    public Guid FileId { get; set; }
    public File File { get; set; }
    public string SharedWithUserId { get; set; }
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
}
