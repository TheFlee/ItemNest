using ItemNest.Domain.Enums;

namespace ItemNest.Application.DTOs;

public class CreateItemPostDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PostType Type { get; set; }
    public ItemColor Color { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTimeOffset EventDate { get; set; }
    public int CategoryId { get; set; }
}

public class UpdateItemPostDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ItemColor Color { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTimeOffset EventDate { get; set; }
    public int CategoryId { get; set; }
    public PostStatus Status { get; set; }
}

public class ItemPostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public PostType Type { get; set; }
    public PostStatus Status { get; set; }
    public ItemColor Color { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTimeOffset EventDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public List<ItemImageDto> Images { get; set; } = new();
}

public class ItemPostFilterDto
{
    public PostType? Type { get; set; }
    public PostStatus? Status { get; set; }
    public ItemColor? Color { get; set; }
    public int? CategoryId { get; set; }
    public string Location { get; set; } = string.Empty;
    public string SearchTerm { get; set; } = string.Empty;
}