namespace ItemNest.Domain.Entities;

public class Favorite
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;

    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;

    public DateTimeOffset CreatedAt { get; set; }
}
