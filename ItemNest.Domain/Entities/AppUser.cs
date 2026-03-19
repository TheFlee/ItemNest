using Microsoft.AspNetCore.Identity;

namespace ItemNest.Domain.Entities;

public class AppUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; } 
    public ICollection<ItemPost> ItemPosts { get; set; } = new List<ItemPost>();
    public ICollection<Report> Reports { get; set; } = new List<Report>();
    public ICollection<Report> ReviewedReports { get; set; } = new List<Report>();
    public ICollection<ContactRequest> SentContactRequests { get; set; } = new List<ContactRequest>();
    public ICollection<ContactRequest> ReceivedContactRequests { get; set; } = new List<ContactRequest>();
}