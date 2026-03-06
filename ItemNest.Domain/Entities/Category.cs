namespace ItemNest.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public ICollection<ItemPost> ItemPosts { get; set; } = new List<ItemPost>();
}
