namespace ItemNest.Domain.Entities;

public class ItemImage
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string StoredFileName { get; set; } = null!;
    public string ContentType { get; set; } = null!;
    public long FileSize { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;
}
