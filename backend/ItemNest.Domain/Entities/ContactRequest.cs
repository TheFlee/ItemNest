using ItemNest.Domain.Enums;

namespace ItemNest.Domain.Entities;

public class ContactRequest
{
    public Guid Id { get; set; }

    public Guid RequesterUserId { get; set; }
    public AppUser RequesterUser { get; set; } = null!;

    public Guid PostOwnerUserId { get; set; }
    public AppUser PostOwnerUser { get; set; } = null!;

    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;

    public string Message { get; set; } = string.Empty;
    public ContactRequestStatus Status { get; set; } = ContactRequestStatus.Pending;

    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
}
