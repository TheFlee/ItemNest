using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IChatService
{
    Task<ChatDto> GetOrCreateAsync(Guid itemPostId, Guid initiatorUserId);
    Task<IReadOnlyList<ChatDto>> GetUserChatsAsync(Guid userId);
    Task<PagedResponseDto<ChatMessageDto>> GetMessagesAsync(Guid chatId, Guid userId, int page, int pageSize);
    Task<ChatMessageDto> SaveMessageAsync(Guid chatId, Guid senderId, string content);
    Task MarkReadAsync(Guid chatId, Guid userId);
    Task<bool> IsParticipantAsync(Guid chatId, Guid userId);
}
