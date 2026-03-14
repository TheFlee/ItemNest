namespace ItemNest.Application.DTOs;

/// <summary>
/// Response model representing a user's favorite item post.
/// </summary>
public class FavoriteDto
{
    /// <summary>
    /// Unique identifier of the favorite record.
    /// </summary>
    /// <example>7d4f6e8f-5a47-4d3b-bdfd-4b5d4c9f1d21</example>
    public Guid Id { get; set; }

    /// <summary>
    /// Identifier of the favorited item post.
    /// </summary>
    /// <example>3f10e9c2-f8c3-4f92-a7a2-9306c6a1d123</example>
    public Guid ItemPostId { get; set; }

    /// <summary>
    /// Title of the favorited post.
    /// </summary>
    /// <example>Black wallet found near metro station</example>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Category name of the favorited item.
    /// </summary>
    /// <example>Wallet</example>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>
    /// URL of the first image attached to the post.
    /// </summary>
    /// <example>/uploads/itemposts/2c276912-318f-4526-ae59-2d3d704f5571.webp</example>
    public string FirstImageUrl { get; set; } = string.Empty;

    /// <summary>
    /// Date and time when the post was added to favorites.
    /// </summary>
    /// <example>2026-03-14T10:45:00+00:00</example>
    public DateTimeOffset CreatedAt { get; set; }
}