namespace ItemNest.Domain.Entities;

public class ItemImage
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;
}
