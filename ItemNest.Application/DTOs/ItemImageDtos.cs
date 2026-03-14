using Microsoft.AspNetCore.Http;

namespace ItemNest.Application.DTOs;

/// <summary>
/// Response model representing an uploaded item image.
/// </summary>
public class ItemImageDto
{
    /// <summary>
    /// Unique identifier of the image.
    /// </summary>
    /// <example>21b5ac70-4df6-483f-8a30-9811860c44a9</example>
    public Guid Id { get; set; }

    /// <summary>
    /// Public URL of the image file.
    /// </summary>
    /// <example>/uploads/itemposts/2c276912-318f-4526-ae59-2d3d704f5571.webp</example>
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary>
    /// Date and time when the image was uploaded.
    /// </summary>
    /// <example>2026-03-11T08:11:15+00:00</example>
    public DateTimeOffset CreatedAt { get; set; }
}

/// <summary>
/// Detailed information about an uploaded image.
/// </summary>
public class ItemImageInfoDto
{
    /// <summary>
    /// Unique identifier of the image.
    /// </summary>
    /// <example>21b5ac70-4df6-483f-8a30-9811860c44a9</example>
    public Guid Id { get; set; }

    /// <summary>
    /// Identifier of the related item post.
    /// </summary>
    /// <example>3f10e9c2-f8c3-4f92-a7a2-9306c6a1d123</example>
    public Guid ItemPostId { get; set; }

    /// <summary>
    /// Public URL of the image file.
    /// </summary>
    /// <example>/uploads/itemposts/2c276912-318f-4526-ae59-2d3d704f5571.webp</example>
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary>
    /// Stored file name on the server.
    /// </summary>
    /// <example>2c276912-318f-4526-ae59-2d3d704f5571.webp</example>
    public string StoredFileName { get; set; } = string.Empty;

    /// <summary>
    /// MIME type of the uploaded file.
    /// </summary>
    /// <example>image/webp</example>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes.
    /// </summary>
    /// <example>245678</example>
    public long FileSize { get; set; }

    /// <summary>
    /// Date and time when the image was uploaded.
    /// </summary>
    /// <example>2026-03-11T08:11:15+00:00</example>
    public DateTimeOffset CreatedAt { get; set; }
}

/// <summary>
/// Request model for uploading an image to an item post.
/// </summary>
public class UploadItemImageDto
{
    /// <summary>
    /// Image file to upload.
    /// </summary>
    public IFormFile File { get; set; } = default!;
}