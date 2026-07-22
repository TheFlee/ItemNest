// backend/ItemNest.Infrastructure/Services/ChatService.cs
using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Exceptions;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly ItemNestDbContext _context;
    private readonly IMapper _mapper;

    public ChatService(ItemNestDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ChatDto> GetOrCreateAsync(Guid itemPostId, Guid initiatorUserId)
    {
        var post = await _context.ItemPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == itemPostId);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId == initiatorUserId)
            throw new InvalidOperationException("Cannot chat with yourself on your own post.");

        var recipientUserId = post.UserId;

        var existing = await _context.Chats
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.ItemPostId == itemPostId &&
                x.InitiatorUserId == initiatorUserId &&
                x.RecipientUserId == recipientUserId);

        if (existing is not null)
            return await BuildChatDtoAsync(existing.Id, initiatorUserId);

        var chat = new Chat
        {
            Id = Guid.NewGuid(),
            ItemPostId = itemPostId,
            InitiatorUserId = initiatorUserId,
            RecipientUserId = recipientUserId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        try
        {
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Race condition: another request created the chat first
            var raceExisting = await _context.Chats
                .AsNoTracking()
                .FirstAsync(x =>
                    x.ItemPostId == itemPostId &&
                    x.InitiatorUserId == initiatorUserId &&
                    x.RecipientUserId == recipientUserId);
            return await BuildChatDtoAsync(raceExisting.Id, initiatorUserId);
        }

        return await BuildChatDtoAsync(chat.Id, initiatorUserId);
    }

    public async Task<IReadOnlyList<ChatDto>> GetUserChatsAsync(Guid userId)
    {
        var chats = await _context.Chats
            .AsNoTracking()
            .Include(x => x.ItemPost)
            .Include(x => x.InitiatorUser)
            .Include(x => x.RecipientUser)
            .Where(x => x.InitiatorUserId == userId || x.RecipientUserId == userId)
            .ToListAsync();

        if (chats.Count == 0)
            return [];

        var chatIds = chats.Select(x => x.Id).ToList();

        var lastMessages = await _context.ChatMessages
            .AsNoTracking()
            .Where(x => chatIds.Contains(x.ChatId))
            .GroupBy(x => x.ChatId)
            .Select(g => g.OrderByDescending(m => m.SentAt).First())
            .ToListAsync();

        var unreadCounts = await _context.ChatMessages
            .AsNoTracking()
            .Where(x => chatIds.Contains(x.ChatId) && x.SenderId != userId && !x.IsRead)
            .GroupBy(x => x.ChatId)
            .Select(g => new { ChatId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ChatId, x => x.Count);

        var lastMessageMap = lastMessages.ToDictionary(x => x.ChatId);

        return chats
            .OrderByDescending(x =>
                lastMessageMap.TryGetValue(x.Id, out var lm) ? lm.SentAt : x.CreatedAt)
            .Select(x =>
            {
                var otherUser = x.InitiatorUserId == userId ? x.RecipientUser : x.InitiatorUser;
                var lastMsg = lastMessageMap.GetValueOrDefault(x.Id);
                return new ChatDto
                {
                    Id = x.Id,
                    ItemPostId = x.ItemPostId,
                    ItemPostTitle = x.ItemPost.Title,
                    ItemPostSlug = x.ItemPost.Slug,
                    OtherUserId = otherUser.Id,
                    OtherUserFullName = otherUser.FullName,
                    LastMessage = lastMsg?.Content,
                    LastMessageAt = lastMsg?.SentAt,
                    UnreadCount = unreadCounts.GetValueOrDefault(x.Id, 0),
                    CreatedAt = x.CreatedAt
                };
            })
            .ToList();
    }

    public async Task<PagedResponseDto<ChatMessageDto>> GetMessagesAsync(
        Guid chatId, Guid userId, int page, int pageSize)
    {
        if (!await IsParticipantAsync(chatId, userId))
            throw new ForbiddenException("Access denied.");

        var query = _context.ChatMessages
            .AsNoTracking()
            .Include(x => x.Sender)
            .Where(x => x.ChatId == chatId)
            .OrderByDescending(x => x.SentAt);

        var total = await query.CountAsync();
        var messages = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Reverse so oldest is first in page
        messages.Reverse();

        return new PagedResponseDto<ChatMessageDto>
        {
            Items = _mapper.Map<List<ChatMessageDto>>(messages),
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = total,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public async Task<ChatMessageDto> SaveMessageAsync(Guid chatId, Guid senderId, string content)
    {
        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ChatId = chatId,
            SenderId = senderId,
            Content = content,
            SentAt = DateTimeOffset.UtcNow,
            IsRead = false
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        var saved = await _context.ChatMessages
            .AsNoTracking()
            .Include(x => x.Sender)
            .FirstAsync(x => x.Id == message.Id);

        return _mapper.Map<ChatMessageDto>(saved);
    }

    public async Task MarkReadAsync(Guid chatId, Guid userId)
    {
        var unread = await _context.ChatMessages
            .Where(x => x.ChatId == chatId && x.SenderId != userId && !x.IsRead)
            .ToListAsync();

        foreach (var msg in unread)
            msg.IsRead = true;

        if (unread.Count > 0)
            await _context.SaveChangesAsync();
    }

    public async Task<bool> IsParticipantAsync(Guid chatId, Guid userId)
    {
        return await _context.Chats
            .AsNoTracking()
            .AnyAsync(x => x.Id == chatId &&
                (x.InitiatorUserId == userId || x.RecipientUserId == userId));
    }

    private async Task<ChatDto> BuildChatDtoAsync(Guid chatId, Guid currentUserId)
    {
        var chat = await _context.Chats
            .AsNoTracking()
            .Include(x => x.ItemPost)
            .Include(x => x.InitiatorUser)
            .Include(x => x.RecipientUser)
            .FirstAsync(x => x.Id == chatId);

        var otherUser = chat.InitiatorUserId == currentUserId
            ? chat.RecipientUser
            : chat.InitiatorUser;

        var lastMsg = await _context.ChatMessages
            .AsNoTracking()
            .Where(x => x.ChatId == chatId)
            .OrderByDescending(x => x.SentAt)
            .FirstOrDefaultAsync();

        var unreadCount = await _context.ChatMessages
            .CountAsync(x => x.ChatId == chatId && x.SenderId != currentUserId && !x.IsRead);

        return new ChatDto
        {
            Id = chat.Id,
            ItemPostId = chat.ItemPostId,
            ItemPostTitle = chat.ItemPost.Title,
            ItemPostSlug = chat.ItemPost.Slug,
            OtherUserId = otherUser.Id,
            OtherUserFullName = otherUser.FullName,
            LastMessage = lastMsg?.Content,
            LastMessageAt = lastMsg?.SentAt,
            UnreadCount = unreadCount,
            CreatedAt = chat.CreatedAt
        };
    }
}
