using ItemNest.Domain.Enums;

namespace ItemNest.Domain.Entities;

public class ItemPost
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public PostType Type { get; set; }
    public PostStatus Status { get; set; }
    public ItemColor Color { get; set; }
    public string Location { get; set; } = null!;
    public DateTime EventDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public ICollection<ItemImage> Images { get; set; } = new List<ItemImage>();
}
