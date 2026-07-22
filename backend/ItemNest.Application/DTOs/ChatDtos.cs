namespace ItemNest.Application.DTOs;

public class ChatDto
{
    public Guid Id { get; set; }
    public Guid ItemPostId { get; set; }
    public string ItemPostTitle { get; set; } = string.Empty;
    public string ItemPostSlug { get; set; } = string.Empty;
    public Guid OtherUserId { get; set; }
    public string OtherUserFullName { get; set; } = string.Empty;
    public string? LastMessage { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
    public int UnreadCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid ChatId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderFullName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset SentAt { get; set; }
    public bool IsRead { get; set; }
}

public class CreateChatDto
{
    public Guid ItemPostId { get; set; }
}
