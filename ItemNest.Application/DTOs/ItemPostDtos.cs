using ItemNest.Domain.Enums;

namespace ItemNest.Application.DTOs;

/// <summary>
/// Request model for creating a new lost or found item post.
/// </summary>
public class CreateItemPostDto
{
    /// <summary>
    /// Title of the post.
    /// </summary>
    /// <example>Lost black wallet near Genclik Mall</example>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the item.
    /// </summary>
    /// <example>Black leather wallet with ID card and bank cards inside.</example>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Type of the post: Lost or Found.
    /// </summary>
    /// <example>Lost</example>
    public PostType Type { get; set; }

    /// <summary>
    /// Color of the item.
    /// </summary>
    /// <example>Black</example>
    public ItemColor Color { get; set; }

    /// <summary>
    /// Location where the item was lost or found.
    /// </summary>
    /// <example>Genclik Mall, Baku</example>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Date and time when the event happened.
    /// </summary>
    /// <example>2026-03-10T14:30:00+04:00</example>
    public DateTimeOffset EventDate { get; set; }

    /// <summary>
    /// Category identifier of the item.
    /// </summary>
    /// <example>1</example>
    public int CategoryId { get; set; }
}

/// <summary>
/// Request model for updating an existing item post.
/// </summary>
public class UpdateItemPostDto
{
    /// <summary>
    /// Updated title of the post.
    /// </summary>
    /// <example>Lost black wallet near metro station</example>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Updated detailed description of the item.
    /// </summary>
    /// <example>Black leather wallet with ID card, found or lost near the metro entrance.</example>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Updated color of the item.
    /// </summary>
    /// <example>Black</example>
    public ItemColor Color { get; set; }

    /// <summary>
    /// Updated location of the event.
    /// </summary>
    /// <example>28 May metro station, Baku</example>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Updated event date.
    /// </summary>
    /// <example>2026-03-10T16:00:00+04:00</example>
    public DateTimeOffset EventDate { get; set; }

    /// <summary>
    /// Updated category identifier.
    /// </summary>
    /// <example>1</example>
    public int CategoryId { get; set; }

    /// <summary>
    /// Current status of the post.
    /// </summary>
    /// <example>Open</example>
    public PostStatus Status { get; set; }
}

/// <summary>
/// Response model representing an item post.
/// </summary>
public class ItemPostDto
{
    /// <summary>
    /// Unique identifier of the item post.
    /// </summary>
    /// <example>3f10e9c2-f8c3-4f92-a7a2-9306c6a1d123</example>
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the post.
    /// </summary>
    /// <example>Lost black wallet near Genclik Mall</example>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the item.
    /// </summary>
    /// <example>Black leather wallet with ID card and bank cards inside.</example>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Type of the post: Lost or Found.
    /// </summary>
    /// <example>Lost</example>
    public PostType Type { get; set; }

    /// <summary>
    /// Current status of the post.
    /// </summary>
    /// <example>Open</example>
    public PostStatus Status { get; set; }

    /// <summary>
    /// Color of the item.
    /// </summary>
    /// <example>Black</example>
    public ItemColor Color { get; set; }

    /// <summary>
    /// Location where the item was lost or found.
    /// </summary>
    /// <example>Genclik Mall, Baku</example>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Date and time when the event happened.
    /// </summary>
    /// <example>2026-03-10T14:30:00+04:00</example>
    public DateTimeOffset EventDate { get; set; }

    /// <summary>
    /// Date and time when the post was created.
    /// </summary>
    /// <example>2026-03-10T15:00:00+04:00</example>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Date and time when the post was last updated.
    /// </summary>
    /// <example>2026-03-11T09:20:00+04:00</example>
    public DateTimeOffset? UpdatedAt { get; set; }

    /// <summary>
    /// Category identifier of the item.
    /// </summary>
    /// <example>1</example>
    public int CategoryId { get; set; }

    /// <summary>
    /// Name of the category.
    /// </summary>
    /// <example>Wallet</example>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>
    /// Identifier of the post owner.
    /// </summary>
    /// <example>5b8a2d90-77f4-4c8d-9463-9483fc7b1f88</example>
    public Guid UserId { get; set; }

    /// <summary>
    /// Full name of the post owner.
    /// </summary>
    /// <example>Firudin Hesenli</example>
    public string UserFullName { get; set; } = string.Empty;

    /// <summary>
    /// List of images attached to the post.
    /// </summary>
    public List<ItemImageDto> Images { get; set; } = new();
}

/// <summary>
/// Query model used for filtering item posts.
/// </summary>
public class ItemPostFilterDto
{
    /// <summary>
    /// Filter by post type.
    /// </summary>
    /// <example>Lost</example>
    public PostType? Type { get; set; }

    /// <summary>
    /// Filter by post status.
    /// </summary>
    /// <example>Open</example>
    public PostStatus? Status { get; set; }

    /// <summary>
    /// Filter by item color.
    /// </summary>
    /// <example>Black</example>
    public ItemColor? Color { get; set; }

    /// <summary>
    /// Filter by category identifier.
    /// </summary>
    /// <example>1</example>
    public int? CategoryId { get; set; }

    /// <summary>
    /// Filter by location.
    /// </summary>
    /// <example>Baku</example>
    public string Location { get; set; } = string.Empty;

    /// <summary>
    /// Search term for title or description.
    /// </summary>
    /// <example>wallet</example>
    public string SearchTerm { get; set; } = string.Empty;
}