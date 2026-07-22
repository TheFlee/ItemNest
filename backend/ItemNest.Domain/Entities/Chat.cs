namespace ItemNest.Domain.Entities;

public class Chat
{
    public Guid Id { get; set; }
    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;
    public Guid InitiatorUserId { get; set; }
    public AppUser InitiatorUser { get; set; } = null!;
    public Guid RecipientUserId { get; set; }
    public AppUser RecipientUser { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
