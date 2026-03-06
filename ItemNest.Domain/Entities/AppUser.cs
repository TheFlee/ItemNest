using Microsoft.AspNetCore.Identity;

namespace ItemNest.Domain.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; } 
    public ICollection<ItemPost> ItemPosts { get; set; } = new List<ItemPost>();
}