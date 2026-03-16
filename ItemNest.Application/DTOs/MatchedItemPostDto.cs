namespace ItemNest.Application.DTOs;

public class MatchedItemPostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTimeOffset EventDate { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public int MatchScore { get; set; }
    public List<string> MatchReasons { get; set; } = [];

    public IReadOnlyCollection<ItemImageDto> Images { get; set; } = [];
}
