using ItemNest.Domain.Enums;

namespace ItemNest.Application.DTOs;

/// <summary>
/// Request model for creating a contact request.
/// </summary>
public class CreateContactRequestDto
{
    /// <summary>
    /// Target item post ID.
    /// </summary>
    public Guid ItemPostId { get; set; }

    /// <summary>
    /// Optional message for the post owner.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Response model for contact requests.
/// </summary>
public class ContactRequestDto
{
    public Guid Id { get; set; }

    public Guid ItemPostId { get; set; }
    public string ItemPostTitle { get; set; } = string.Empty;

    public Guid RequesterUserId { get; set; }
    public string RequesterFullName { get; set; } = string.Empty;
    public string? RequesterEmail { get; set; }

    public Guid PostOwnerUserId { get; set; }
    public string PostOwnerFullName { get; set; } = string.Empty;
    public string? PostOwnerEmail { get; set; }

    public string Message { get; set; } = string.Empty;
    public ContactRequestStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
}
