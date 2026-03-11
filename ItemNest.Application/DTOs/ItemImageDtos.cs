using Microsoft.AspNetCore.Http;

namespace ItemNest.Application.DTOs;

public class ItemImageDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class ItemImageInfoDto
{
    public Guid Id { get; set; }
    public Guid ItemPostId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class UploadItemImageDto
{
    public IFormFile File { get; set; } = default!;
}