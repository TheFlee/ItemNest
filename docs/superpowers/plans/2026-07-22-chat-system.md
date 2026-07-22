# Chat System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ContactRequest system with a real-time per-post SignalR chat system.

**Architecture:** SignalR WebSocket hub for real-time delivery; PostgreSQL via EF Core for persistence; REST endpoints for chat creation and message history; nightly BackgroundService cleans messages older than 60 days. Frontend uses `@microsoft/signalr` client with a custom `useChat` hook.

**Tech Stack:** .NET 9, ASP.NET Core SignalR, EF Core 9 + PostgreSQL, React 19 + TypeScript, @microsoft/signalr, Tailwind CSS, frontend-design skill for UI components.

## Global Constraints

- All monetary/ID types: Guid for entities, string in frontend TypeScript
- Max message length: 2000 characters (enforced at DB and validation layer)
- Chat is always exactly two participants: InitiatorUser (requester) and RecipientUser (post owner)
- Post owner cannot initiate a chat with themselves on their own post
- Hub methods must verify participant membership before every operation
- JWT passed as `?access_token=` query string to SignalR (not cookie)
- Frontend: language-aware routing via `useLangNavigate` / `LLink` wrappers
- Frontend: auth token accessed via `useAuth().token`
- Frontend: API base URL from `import.meta.env.VITE_API_BASE_URL`

---

## File Map

**New — Backend:**
- `backend/ItemNest.Domain/Entities/Chat.cs` — Chat entity
- `backend/ItemNest.Domain/Entities/ChatMessage.cs` — ChatMessage entity
- `backend/ItemNest.Application/DTOs/ChatDtos.cs` — ChatDto, ChatMessageDto, CreateChatDto
- `backend/ItemNest.Application/Interfaces/IChatService.cs` — service interface
- `backend/ItemNest.Infrastructure/Services/ChatService.cs` — service implementation
- `backend/ItemNest.Infrastructure/Services/ChatCleanupService.cs` — BackgroundService
- `backend/ItemNest.Api/Hubs/ChatHub.cs` — SignalR hub
- `backend/ItemNest.Api/Controllers/ChatsController.cs` — REST endpoints

**Modified — Backend:**
- `backend/ItemNest.Infrastructure/Data/ItemNestDbContext.cs` — add Chat/ChatMessage DbSets + EF config, remove ContactRequest config
- `backend/ItemNest.Api/Extensions/AuthenticationExtensions.cs` — add OnMessageReceived for SignalR JWT
- `backend/ItemNest.Api/Extensions/ApplicationServicesExtensions.cs` — add ChatService + ChatCleanupService, remove ContactRequestService
- `backend/ItemNest.Api/Program.cs` — AddSignalR + MapHub, update CORS AllowCredentials
- `backend/ItemNest.Application/Mappings/MappingProfile.cs` — add ChatMessage → ChatMessageDto
- `backend/ItemNest.Domain/Entities/AppUser.cs` — remove ContactRequest nav props
- `backend/ItemNest.Domain/Entities/ItemPost.cs` — remove ContactRequests nav prop

**Deleted — Backend:**
- `backend/ItemNest.Domain/Entities/ContactRequest.cs`
- `backend/ItemNest.Application/DTOs/ContactRequestDtos.cs`
- `backend/ItemNest.Application/Interfaces/IContactRequestService.cs`
- `backend/ItemNest.Infrastructure/Services/ContactRequestService.cs`
- `backend/ItemNest.Api/Controllers/ContactRequestsController.cs`
- Any `ContactRequestStatus` enum file

**New — Frontend:**
- `frontend/src/types/chat.ts`
- `frontend/src/api/chatApi.ts`
- `frontend/src/hooks/useChat.ts`
- `frontend/src/pages/chat/ChatsPage.tsx`
- `frontend/src/pages/chat/ChatPage.tsx`

**Modified — Frontend:**
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/pages/posts/PostDetailsPage.tsx`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/pages/dashboard/DashboardPage.tsx`
- `frontend/src/i18n/locales/en.ts`
- `frontend/src/i18n/locales/az.ts`
- `frontend/package.json`

**Deleted — Frontend:**
- `frontend/src/pages/contactRequests/SentContactRequestsPage.tsx`
- `frontend/src/pages/contactRequests/ReceivedContactRequestsPage.tsx`
- `frontend/src/types/contactRequest.ts`
- `frontend/src/api/contactRequestApi.ts`

---

## Task 1: Domain Entities + EF Core Config + Migration

**Files:**
- Create: `backend/ItemNest.Domain/Entities/Chat.cs`
- Create: `backend/ItemNest.Domain/Entities/ChatMessage.cs`
- Modify: `backend/ItemNest.Infrastructure/Data/ItemNestDbContext.cs`

**Interfaces:**
- Produces: `Chat` entity with `Id`, `ItemPostId`, `InitiatorUserId`, `RecipientUserId`, `CreatedAt`, nav props `ItemPost`, `InitiatorUser`, `RecipientUser`, `Messages`
- Produces: `ChatMessage` entity with `Id`, `ChatId`, `SenderId`, `Content`, `SentAt`, `IsRead`, nav props `Chat`, `Sender`
- Produces: `ItemNestDbContext.Chats` and `ItemNestDbContext.ChatMessages` DbSets

- [ ] **Step 1: Create Chat entity**

```csharp
// backend/ItemNest.Domain/Entities/Chat.cs
namespace ItemNest.Domain.Entities;

public class Chat
{
    public Guid Id { get; set; }
    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;
    public Guid InitiatorUserId { get; set; }
    public AppUser InitiatorUser { get; set; } = null!;
    public Guid RecipientUserId { get; set; }
    public AppUser RecipientUser { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
```

- [ ] **Step 2: Create ChatMessage entity**

```csharp
// backend/ItemNest.Domain/Entities/ChatMessage.cs
namespace ItemNest.Domain.Entities;

public class ChatMessage
{
    public Guid Id { get; set; }
    public Guid ChatId { get; set; }
    public Chat Chat { get; set; } = null!;
    public Guid SenderId { get; set; }
    public AppUser Sender { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public DateTimeOffset SentAt { get; set; }
    public bool IsRead { get; set; }
}
```

- [ ] **Step 3: Add DbSets and EF config to ItemNestDbContext**

Add after `ContactRequests` line (line 19):
```csharp
public DbSet<Chat> Chats => Set<Chat>();
public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
```

Add at the end of `OnModelCreating`, before the closing brace:
```csharp
builder.Entity<Chat>(entity =>
{
    entity.HasKey(x => x.Id);
    entity.Property(x => x.CreatedAt).IsRequired();

    entity.HasOne(x => x.ItemPost)
        .WithMany()
        .HasForeignKey(x => x.ItemPostId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(x => x.InitiatorUser)
        .WithMany()
        .HasForeignKey(x => x.InitiatorUserId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasOne(x => x.RecipientUser)
        .WithMany()
        .HasForeignKey(x => x.RecipientUserId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasIndex(x => new { x.ItemPostId, x.InitiatorUserId, x.RecipientUserId })
        .IsUnique();
});

builder.Entity<ChatMessage>(entity =>
{
    entity.HasKey(x => x.Id);
    entity.Property(x => x.Content).IsRequired().HasMaxLength(2000);
    entity.Property(x => x.SentAt).IsRequired();
    entity.Property(x => x.IsRead).IsRequired().HasDefaultValue(false);

    entity.HasOne(x => x.Chat)
        .WithMany(x => x.Messages)
        .HasForeignKey(x => x.ChatId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(x => x.Sender)
        .WithMany()
        .HasForeignKey(x => x.SenderId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasIndex(x => x.ChatId);
    entity.HasIndex(x => x.SentAt);
});
```

- [ ] **Step 4: Run migration**

```powershell
cd backend
dotnet ef migrations add AddChatTables --project ItemNest.Infrastructure --startup-project ItemNest.Api
```

Expected: migration file created in `ItemNest.Infrastructure/Migrations/`

- [ ] **Step 5: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 6: Commit**

```powershell
git add backend/ItemNest.Domain/Entities/Chat.cs backend/ItemNest.Domain/Entities/ChatMessage.cs backend/ItemNest.Infrastructure/Data/ItemNestDbContext.cs backend/ItemNest.Infrastructure/Migrations/
git commit -m "add Chat and ChatMessage entities with EF Core config and migration"
```

---

## Task 2: Application Layer — DTOs + Interface + Mapping

**Files:**
- Create: `backend/ItemNest.Application/DTOs/ChatDtos.cs`
- Create: `backend/ItemNest.Application/Interfaces/IChatService.cs`
- Modify: `backend/ItemNest.Application/Mappings/MappingProfile.cs`

**Interfaces:**
- Produces: `ChatDto`, `ChatMessageDto`, `CreateChatDto`
- Produces: `IChatService` with methods `GetOrCreateAsync`, `GetUserChatsAsync`, `GetMessagesAsync`, `SaveMessageAsync`, `MarkReadAsync`, `IsParticipantAsync`
- Produces: AutoMapper mapping `ChatMessage → ChatMessageDto`

- [ ] **Step 1: Create ChatDtos.cs**

```csharp
// backend/ItemNest.Application/DTOs/ChatDtos.cs
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
```

- [ ] **Step 2: Create IChatService.cs**

```csharp
// backend/ItemNest.Application/Interfaces/IChatService.cs
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
```

- [ ] **Step 3: Add mapping in MappingProfile.cs**

Add inside the `MappingProfile()` constructor, after the `ItemImage` mapping:
```csharp
// Chat
CreateMap<ChatMessage, ChatMessageDto>()
    .ForMember(dest => dest.SenderFullName,
        opt => opt.MapFrom(src => src.Sender.FullName));
```

- [ ] **Step 4: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 5: Commit**

```powershell
git add backend/ItemNest.Application/DTOs/ChatDtos.cs backend/ItemNest.Application/Interfaces/IChatService.cs backend/ItemNest.Application/Mappings/MappingProfile.cs
git commit -m "add chat DTOs, IChatService interface, and AutoMapper mapping"
```

---

## Task 3: ChatService Implementation

**Files:**
- Create: `backend/ItemNest.Infrastructure/Services/ChatService.cs`

**Interfaces:**
- Consumes: `IChatService`, `ChatDto`, `ChatMessageDto`, `CreateChatDto`, `PagedResponseDto<T>`, `ItemNestDbContext`, `IMapper`, `ForbiddenException`
- Produces: `ChatService : IChatService` — full implementation of all six methods

- [ ] **Step 1: Create ChatService.cs**

```csharp
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
```

- [ ] **Step 2: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 3: Commit**

```powershell
git add backend/ItemNest.Infrastructure/Services/ChatService.cs
git commit -m "implement ChatService with GetOrCreate, message history, unread counts, and participant guard"
```

---

## Task 4: ChatCleanupService

**Files:**
- Create: `backend/ItemNest.Infrastructure/Services/ChatCleanupService.cs`

**Interfaces:**
- Consumes: `ItemNestDbContext` (via `IServiceScopeFactory`), `ILogger<ChatCleanupService>`
- Produces: `ChatCleanupService : BackgroundService` — deletes messages > 60 days old nightly

- [ ] **Step 1: Create ChatCleanupService.cs**

```csharp
// backend/ItemNest.Infrastructure/Services/ChatCleanupService.cs
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ItemNest.Infrastructure.Services;

public class ChatCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ChatCleanupService> _logger;

    public ChatCleanupService(IServiceScopeFactory scopeFactory, ILogger<ChatCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTimeOffset.UtcNow;
            var nextMidnight = new DateTimeOffset(now.Date.AddDays(1), TimeSpan.Zero);
            await Task.Delay(nextMidnight - now, stoppingToken);

            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chat cleanup failed");
            }
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ItemNestDbContext>();

        var cutoff = DateTimeOffset.UtcNow.AddDays(-60);

        var oldMessages = await context.ChatMessages
            .Where(x => x.SentAt < cutoff)
            .ToListAsync(ct);

        context.ChatMessages.RemoveRange(oldMessages);
        await context.SaveChangesAsync(ct);

        // Delete chats that now have no messages
        var emptyChatIds = await context.Chats
            .Where(x => !context.ChatMessages.Any(m => m.ChatId == x.Id))
            .Select(x => x.Id)
            .ToListAsync(ct);

        var emptyChats = await context.Chats
            .Where(x => emptyChatIds.Contains(x.Id))
            .ToListAsync(ct);

        context.Chats.RemoveRange(emptyChats);
        await context.SaveChangesAsync(ct);

        _logger.LogInformation(
            "Chat cleanup complete: {Messages} messages and {Chats} empty chats deleted",
            oldMessages.Count, emptyChats.Count);
    }
}
```

- [ ] **Step 2: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 3: Commit**

```powershell
git add backend/ItemNest.Infrastructure/Services/ChatCleanupService.cs
git commit -m "add ChatCleanupService to delete messages older than 60 days nightly"
```

---

## Task 5: SignalR ChatHub

**Files:**
- Create: `backend/ItemNest.Api/Hubs/ChatHub.cs`

**Interfaces:**
- Consumes: `IChatService`, JWT claim `ClaimTypes.NameIdentifier`
- Produces: `ChatHub : Hub` with methods `JoinChat(Guid)`, `LeaveChat(Guid)`, `SendMessage(Guid, string)`, `MarkRead(Guid)`; broadcasts `ReceiveMessage(ChatMessageDto)` and `MessagesRead(Guid)` to group

- [ ] **Step 1: Create ChatHub.cs**

```csharp
// backend/ItemNest.Api/Hubs/ChatHub.cs
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ItemNest.Api.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    public async Task JoinChat(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (!await _chatService.IsParticipantAsync(chatId, userId))
            throw new HubException("Access denied.");

        await Groups.AddToGroupAsync(Context.ConnectionId, chatId.ToString());
    }

    public async Task LeaveChat(Guid chatId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId.ToString());
    }

    public async Task SendMessage(Guid chatId, string content)
    {
        var userId = GetCurrentUserId();
        if (!await _chatService.IsParticipantAsync(chatId, userId))
            throw new HubException("Access denied.");

        if (string.IsNullOrWhiteSpace(content) || content.Length > 2000)
            throw new HubException("Message content is invalid.");

        var message = await _chatService.SaveMessageAsync(chatId, userId, content);
        await Clients.Group(chatId.ToString()).SendAsync("ReceiveMessage", message);
    }

    public async Task MarkRead(Guid chatId)
    {
        var userId = GetCurrentUserId();
        if (!await _chatService.IsParticipantAsync(chatId, userId))
            throw new HubException("Access denied.");

        await _chatService.MarkReadAsync(chatId, userId);
        await Clients.Group(chatId.ToString()).SendAsync("MessagesRead", chatId);
    }

    private Guid GetCurrentUserId()
    {
        var claim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? Context.User?.FindFirstValue(ClaimTypes.Name)
                    ?? Context.User?.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(claim))
            throw new HubException("Unauthorized.");

        return Guid.Parse(claim);
    }
}
```

- [ ] **Step 2: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 3: Commit**

```powershell
git add backend/ItemNest.Api/Hubs/ChatHub.cs
git commit -m "add ChatHub with JoinChat, SendMessage, MarkRead, and participant authorization"
```

---

## Task 6: ChatsController + Wire Up (SignalR, Services, JWT)

**Files:**
- Create: `backend/ItemNest.Api/Controllers/ChatsController.cs`
- Modify: `backend/ItemNest.Api/Extensions/ApplicationServicesExtensions.cs`
- Modify: `backend/ItemNest.Api/Extensions/AuthenticationExtensions.cs`
- Modify: `backend/ItemNest.Api/Program.cs`

**Interfaces:**
- Consumes: `IChatService`, `ChatDto`, `ChatMessageDto`, `CreateChatDto`, `PagedResponseDto<T>`
- Produces: REST endpoints `POST /api/chats`, `GET /api/chats`, `GET /api/chats/{id}/messages`
- Produces: SignalR hub mapped at `/hubs/chat`

- [ ] **Step 1: Create ChatsController.cs**

```csharp
// backend/ItemNest.Api/Controllers/ChatsController.cs
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ChatsController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatsController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<ActionResult<ChatDto>> GetOrCreate([FromBody] CreateChatDto dto)
    {
        var userId = GetCurrentUserId();
        var chat = await _chatService.GetOrCreateAsync(dto.ItemPostId, userId);
        return Ok(chat);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ChatDto>>> GetUserChats()
    {
        var userId = GetCurrentUserId();
        var chats = await _chatService.GetUserChatsAsync(userId);
        return Ok(chats);
    }

    [HttpGet("{id:guid}/messages")]
    public async Task<ActionResult<PagedResponseDto<ChatMessageDto>>> GetMessages(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var userId = GetCurrentUserId();
        var messages = await _chatService.GetMessagesAsync(id, userId, page, pageSize);
        return Ok(messages);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue(ClaimTypes.Name)
                    ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(claim))
            throw new UnauthorizedAccessException("User information was not found in the token.");

        return Guid.Parse(claim);
    }
}
```

- [ ] **Step 2: Add ChatService + ChatCleanupService to ApplicationServicesExtensions.cs**

Replace:
```csharp
services.AddScoped<IContactRequestService, ContactRequestService>();
```
With:
```csharp
services.AddScoped<IChatService, ChatService>();
services.AddHostedService<ChatCleanupService>();
```

Also add the using if needed — the file already uses `ItemNest.Infrastructure.Services` implicitly via the other registrations.

- [ ] **Step 3: Add SignalR JWT query-string handler to AuthenticationExtensions.cs**

The existing `options.Events` block has `OnTokenValidated`. Add `OnMessageReceived` to it:

Replace the entire `options.Events = new JwtBearerEvents { ... }` block with:
```csharp
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
            context.Token = accessToken;
        return Task.CompletedTask;
    },
    OnTokenValidated = async context =>
    {
        var userManager = context.HttpContext.RequestServices
            .GetRequiredService<UserManager<AppUser>>();

        var userIdClaim = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? context.Principal?.FindFirstValue(ClaimTypes.Name)
                         ?? context.Principal?.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Fail("Invalid authentication token.");
            return;
        }

        var user = await userManager.FindByIdAsync(userId.ToString());

        if (user is null || user.IsBlocked)
            context.Fail("This account is blocked.");
    }
};
```

- [ ] **Step 4: Add SignalR to Program.cs**

After `builder.Services.AddAuthorization();` (line 38), add:
```csharp
builder.Services.AddSignalR();
```

After `app.MapControllers();` (line 90), add:
```csharp
app.MapHub<ChatHub>("/hubs/chat");
```

Also add the using at the top of Program.cs:
```csharp
using ItemNest.Api.Hubs;
```

Also update the CORS policy to add `AllowCredentials()` — SignalR negotiate requires it:
```csharp
policy
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials();
```

- [ ] **Step 5: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 6: Commit**

```powershell
git add backend/ItemNest.Api/Controllers/ChatsController.cs backend/ItemNest.Api/Extensions/ backend/ItemNest.Api/Program.cs
git commit -m "add ChatsController, wire up SignalR hub, register ChatService and ChatCleanupService"
```

---

## Task 7: Remove ContactRequest Backend

**Files:**
- Delete: `backend/ItemNest.Domain/Entities/ContactRequest.cs`
- Delete: `backend/ItemNest.Application/DTOs/ContactRequestDtos.cs`
- Delete: `backend/ItemNest.Application/Interfaces/IContactRequestService.cs`
- Delete: `backend/ItemNest.Infrastructure/Services/ContactRequestService.cs`
- Delete: `backend/ItemNest.Api/Controllers/ContactRequestsController.cs`
- Delete: any `ContactRequestStatus.cs` enum file (check `backend/ItemNest.Domain/Enums/`)
- Modify: `backend/ItemNest.Domain/Entities/AppUser.cs` — remove ContactRequest nav props
- Modify: `backend/ItemNest.Domain/Entities/ItemPost.cs` — remove ContactRequests nav prop
- Modify: `backend/ItemNest.Infrastructure/Data/ItemNestDbContext.cs` — remove ContactRequest DbSet + EF config

- [ ] **Step 1: Remove ContactRequest nav props from AppUser.cs**

Remove these two lines:
```csharp
public ICollection<ContactRequest> SentContactRequests { get; set; } = new List<ContactRequest>();
public ICollection<ContactRequest> ReceivedContactRequests { get; set; } = new List<ContactRequest>();
```

- [ ] **Step 2: Remove ContactRequests nav prop from ItemPost.cs**

Open `backend/ItemNest.Domain/Entities/ItemPost.cs` and remove the line:
```csharp
public ICollection<ContactRequest> ContactRequests { get; set; } = new List<ContactRequest>();
```

- [ ] **Step 3: Remove from ItemNestDbContext.cs**

Remove the DbSet line:
```csharp
public DbSet<ContactRequest> ContactRequests => Set<ContactRequest>();
```

Remove the entire `builder.Entity<ContactRequest>(entity => { ... });` block from `OnModelCreating` (lines 192–221 in the original file).

- [ ] **Step 4: Delete backend files**

```powershell
Remove-Item backend/ItemNest.Domain/Entities/ContactRequest.cs
Remove-Item backend/ItemNest.Application/DTOs/ContactRequestDtos.cs
Remove-Item backend/ItemNest.Application/Interfaces/IContactRequestService.cs
Remove-Item backend/ItemNest.Infrastructure/Services/ContactRequestService.cs
Remove-Item backend/ItemNest.Api/Controllers/ContactRequestsController.cs
```

Also check and delete if exists:
```powershell
Get-ChildItem backend/ItemNest.Domain/Enums/ | Where-Object { $_.Name -like "*ContactRequest*" } | Remove-Item
```

- [ ] **Step 5: Add migration to drop ContactRequests table**

```powershell
cd backend
dotnet ef migrations add RemoveContactRequests --project ItemNest.Infrastructure --startup-project ItemNest.Api
```

Expected: migration generated that drops `ContactRequests` table.

- [ ] **Step 6: Build check**

```powershell
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "remove ContactRequest system — replaced by chat"
```

---

## Task 8: Frontend Setup — Types, API Client, SignalR Hook

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Create: `frontend/src/types/chat.ts`
- Create: `frontend/src/api/chatApi.ts`
- Create: `frontend/src/hooks/useChat.ts`

**Interfaces:**
- Produces: `ChatItem`, `ChatMessageItem` TypeScript types
- Produces: `getOrCreateChat(itemPostId)`, `getUserChats()`, `getChatMessages(chatId, page, pageSize)` API functions
- Produces: `useChat(chatId, token)` hook returning `{ messages, isConnected, sendMessage }`

- [ ] **Step 1: Install @microsoft/signalr**

```powershell
cd frontend
npm install @microsoft/signalr
```

Expected: package added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Create frontend/src/types/chat.ts**

```typescript
export interface ChatItem {
  id: string;
  itemPostId: string;
  itemPostTitle: string;
  itemPostSlug: string;
  otherUserId: string;
  otherUserFullName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessageItem {
  id: string;
  chatId: string;
  senderId: string;
  senderFullName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}
```

- [ ] **Step 3: Create frontend/src/api/chatApi.ts**

```typescript
import api from './axios';
import type { ChatItem, ChatMessageItem } from '../types/chat';

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function getOrCreateChat(itemPostId: string): Promise<ChatItem> {
  const response = await api.post<ChatItem>('/chats', { itemPostId });
  return response.data;
}

export async function getUserChats(): Promise<ChatItem[]> {
  const response = await api.get<ChatItem[]>('/chats');
  return response.data;
}

export async function getChatMessages(
  chatId: string,
  page = 1,
  pageSize = 50
): Promise<PagedResponse<ChatMessageItem>> {
  const response = await api.get<PagedResponse<ChatMessageItem>>(
    `/chats/${chatId}/messages`,
    { params: { page, pageSize } }
  );
  return response.data;
}
```

- [ ] **Step 4: Create frontend/src/hooks/useChat.ts**

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { ChatMessageItem } from '../types/chat';
import { getChatMessages } from '../api/chatApi';

export function useChat(chatId: string, token: string | null) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!token || !chatId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/chat`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (message: ChatMessageItem) => {
      setMessages((prev) => [...prev, message]);
    });

    connection.on('MessagesRead', () => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    connectionRef.current = connection;

    const start = async () => {
      await connection.start();
      setIsConnected(true);
      await connection.invoke('JoinChat', chatId);

      const result = await getChatMessages(chatId);
      setMessages(result.items); // already oldest-first from server

      await connection.invoke('MarkRead', chatId);
    };

    start().catch(console.error);

    return () => {
      connection
        .invoke('LeaveChat', chatId)
        .catch(console.error)
        .finally(() => {
          connection.stop();
          setIsConnected(false);
        });
    };
  }, [chatId, token]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (
        connectionRef.current?.state === signalR.HubConnectionState.Connected
      ) {
        await connectionRef.current.invoke('SendMessage', chatId, content);
      }
    },
    [chatId]
  );

  return { messages, isConnected, sendMessage };
}
```

- [ ] **Step 5: TypeScript check**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 6: Commit**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/src/types/chat.ts frontend/src/api/chatApi.ts frontend/src/hooks/useChat.ts
git commit -m "add chat types, API client, and useChat SignalR hook"
```

---

## Task 9: Frontend ChatsPage (Inbox)

**Files:**
- Create: `frontend/src/pages/chat/ChatsPage.tsx`

**Interfaces:**
- Consumes: `getUserChats()` → `ChatItem[]`, `useLangNavigate`, `useAuth`
- Produces: `/en/chats` page — inbox list of conversations

- [ ] **Step 1: Invoke frontend-design skill**

Invoke the `frontend-design:frontend-design` skill with this prompt:

> Build `ChatsPage.tsx` for ItemNest — a lost & found platform. This is the chat inbox page at route `/:lang/chats`.
>
> **Data:** Call `getUserChats()` from `../api/chatApi` on mount. Returns `ChatItem[]`:
> ```typescript
> interface ChatItem {
>   id: string;
>   itemPostId: string;
>   itemPostTitle: string;
>   itemPostSlug: string;
>   otherUserId: string;
>   otherUserFullName: string;
>   lastMessage: string | null;
>   lastMessageAt: string | null;
>   unreadCount: number;
>   createdAt: string;
> }
> ```
>
> **Routing:** Navigate to chat using `useLangNavigate` from `../../hooks/useLangPath` — go to `/chats/${chat.id}` on card click.
>
> **Navigation to post:** Use `LLink` from `../../components/common/LLink` to link to `/posts/${chat.itemPostSlug}`.
>
> **Auth:** Use `useAuth` from `../../context/AuthContext`. Redirect to `/:lang/login` if not authenticated.
>
> **UI Requirements:**
> - Page title "Chats" / "Söhbətlər" (i18n key `chat.inbox`)
> - Each conversation shown as a card with: other user's name, post title (clickable link to the post), last message preview (truncated at 60 chars), relative timestamp (e.g. "2 hours ago"), unread count badge (show only if > 0, red badge)
> - Empty state: icon + "No conversations yet" message
> - Loading skeleton while fetching
> - Cards sorted by `lastMessageAt` descending (already sorted from API)
> - Clicking a card navigates to `/chats/${chat.id}`
> - Follow existing app design: Tailwind CSS, consistent with other pages like `FavoritesPage` or `DashboardPage`
>
> Save file to `frontend/src/pages/chat/ChatsPage.tsx`.

- [ ] **Step 2: TypeScript check**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/pages/chat/ChatsPage.tsx
git commit -m "add ChatsPage inbox with conversation list and unread badges"
```

---

## Task 10: Frontend ChatPage (Real-time Chat Window)

**Files:**
- Create: `frontend/src/pages/chat/ChatPage.tsx`

**Interfaces:**
- Consumes: `useChat(chatId, token)` hook from `../../hooks/useChat`, `useAuth`, `useLangNavigate`, `useParams` for `chatId`
- Produces: `/:lang/chats/:chatId` page — real-time chat window

- [ ] **Step 1: Invoke frontend-design skill**

Invoke the `frontend-design:frontend-design` skill with this prompt:

> Build `ChatPage.tsx` for ItemNest — a lost & found platform. This is the real-time chat window at route `/:lang/chats/:chatId`.
>
> **Hook:** Use `useChat(chatId, token)` from `../../hooks/useChat`:
> ```typescript
> const { messages, isConnected, sendMessage } = useChat(chatId, token);
> ```
> Get `chatId` from `useParams<{ chatId: string }>()`. Get `token` from `useAuth().token`. Get current user ID from `useAuth().user?.id`.
>
> **Message type:**
> ```typescript
> interface ChatMessageItem {
>   id: string;
>   chatId: string;
>   senderId: string;
>   senderFullName: string;
>   content: string;
>   sentAt: string;
>   isRead: boolean;
> }
> ```
>
> **Auth:** Use `useAuth` from `../../context/AuthContext`. Redirect if not authenticated.
>
> **UI Requirements:**
> - Full-height chat layout (header + scrollable message area + input bar at bottom)
> - Back button navigating to `/:lang/chats` using `useLangNavigate`
> - Connection status indicator (green dot "Connected" / grey "Connecting...")
> - Messages in bubble style: current user's messages on right (blue/primary color), other user's on left (grey)
> - Each bubble shows sender name (for other user only), message content, time (HH:mm format)
> - Auto-scroll to bottom when new messages arrive or on initial load (use `useEffect` + `useRef` on scroll container)
> - Input bar: textarea (1 row, expands to 3 max), character counter `{length}/2000`, send button disabled when empty or > 2000 chars
> - Send on Enter (without Shift); Shift+Enter adds newline
> - Show "No messages yet. Say hello!" when `messages` is empty
> - Follow existing app design: Tailwind CSS, consistent with other pages
>
> Save file to `frontend/src/pages/chat/ChatPage.tsx`.

- [ ] **Step 2: TypeScript check**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```powershell
git add frontend/src/pages/chat/ChatPage.tsx
git commit -m "add ChatPage real-time chat window with SignalR, bubble UI, and auto-scroll"
```

---

## Task 11: Frontend Wiring + Remove Contact Requests

**Files:**
- Modify: `frontend/src/router/AppRouter.tsx`
- Modify: `frontend/src/pages/posts/PostDetailsPage.tsx`
- Modify: `frontend/src/components/layout/Navbar.tsx`
- Modify: `frontend/src/pages/dashboard/DashboardPage.tsx`
- Modify: `frontend/src/i18n/locales/en.ts`
- Modify: `frontend/src/i18n/locales/az.ts`
- Delete: `frontend/src/pages/contactRequests/SentContactRequestsPage.tsx`
- Delete: `frontend/src/pages/contactRequests/ReceivedContactRequestsPage.tsx`
- Delete: `frontend/src/types/contactRequest.ts`
- Delete: `frontend/src/api/contactRequestApi.ts`

**Interfaces:**
- Consumes: `ChatsPage`, `ChatPage`, `getOrCreateChat`, `useLangNavigate`

- [ ] **Step 1: Add i18n keys**

In `frontend/src/i18n/locales/en.ts`, add inside the translations object:
```typescript
chat: {
  inbox: 'Chats',
  noConversations: 'No conversations yet',
  startChat: 'Chat',
  connected: 'Connected',
  connecting: 'Connecting...',
  noMessages: 'No messages yet. Say hello!',
  inputPlaceholder: 'Type a message...',
  send: 'Send',
},
```

In `frontend/src/i18n/locales/az.ts`, add inside the translations object:
```typescript
chat: {
  inbox: 'Söhbətlər',
  noConversations: 'Hələ söhbət yoxdur',
  startChat: 'Söhbət et',
  connected: 'Bağlı',
  connecting: 'Bağlanır...',
  noMessages: 'Hələ mesaj yoxdur. Salam de!',
  inputPlaceholder: 'Mesaj yazın...',
  send: 'Göndər',
},
```

- [ ] **Step 2: Update AppRouter.tsx**

Add imports:
```typescript
import ChatsPage from '../pages/chat/ChatsPage';
import ChatPage from '../pages/chat/ChatPage';
```

Add routes inside the authenticated routes section (wherever `SentContactRequestsPage` and `ReceivedContactRequestsPage` routes currently are):
```tsx
<Route path="chats" element={<ChatsPage />} />
<Route path="chats/:chatId" element={<ChatPage />} />
```

Remove the `SentContactRequestsPage` and `ReceivedContactRequestsPage` route entries and their imports.

- [ ] **Step 3: Update PostDetailsPage.tsx — replace Contact button with Chat**

Find the "Contact Owner" button (search for `contactRequest` or `ContactRequest` in the file). Replace the button and its handler with:

```tsx
const lnav = useLangNavigate();

const handleChat = async () => {
  try {
    const chat = await getOrCreateChat(post.id);
    lnav(`/chats/${chat.id}`);
  } catch {
    // show toast error if needed
  }
};
```

Replace the contact button JSX with:
```tsx
<button onClick={handleChat} className="...existing button classes...">
  {t('chat.startChat')}
</button>
```

Add import at top:
```typescript
import { getOrCreateChat } from '../../api/chatApi';
```

Remove all contact request imports and state from the file.

- [ ] **Step 4: Update Navbar.tsx**

Find the contact request nav links (search for `contactrequests` or `SentContactRequests` in the file). Replace with a single Chats link:

```tsx
<LNavLink to="/chats">
  {t('chat.inbox')}
</LNavLink>
```

Remove contact request imports.

- [ ] **Step 5: Update DashboardPage.tsx**

Find the contact request stats section. Replace with chat stats using the existing `getUserChats()` call:

```tsx
// Add near other useEffect data fetching:
const [chats, setChats] = useState<ChatItem[]>([]);

useEffect(() => {
  getUserChats().then(setChats).catch(console.error);
}, []);

const totalChats = chats.length;
const unreadChats = chats.filter(c => c.unreadCount > 0).length;
```

Replace contact request stat cards with:
```tsx
<StatCard label={t('chat.inbox')} value={totalChats} />
<StatCard label="Unread" value={unreadChats} />
```

Add imports:
```typescript
import { getUserChats } from '../../api/chatApi';
import type { ChatItem } from '../../types/chat';
```

Remove all contact request imports and state.

- [ ] **Step 6: Delete contact request frontend files**

```powershell
Remove-Item frontend/src/pages/contactRequests/SentContactRequestsPage.tsx
Remove-Item frontend/src/pages/contactRequests/ReceivedContactRequestsPage.tsx
Remove-Item frontend/src/types/contactRequest.ts
Remove-Item frontend/src/api/contactRequestApi.ts
```

Check if `frontend/src/pages/contactRequests/` directory is now empty and remove it:
```powershell
Remove-Item frontend/src/pages/contactRequests/ -ErrorAction SilentlyContinue
```

- [ ] **Step 7: TypeScript check**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: no output (zero errors). Fix any remaining import references to deleted files.

- [ ] **Step 8: Final backend build check**

```powershell
cd backend
dotnet build
```

Expected: `Build succeeded. 0 Warning(s). 0 Error(s).`

- [ ] **Step 9: Commit**

```powershell
git add -A
git commit -m "wire up chat routes, update PostDetailsPage/Navbar/Dashboard, remove contact request pages"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Chat entity per-post with initiator/recipient — Task 1
- ✅ No gating (direct chat from post) — Task 6 (`POST /api/chats` creates immediately), Task 11 (PostDetailsPage Chat button)
- ✅ Real-time via SignalR — Tasks 5, 6, 8, 10
- ✅ JWT query-string auth for SignalR — Task 6
- ✅ 60-day message cleanup — Task 4
- ✅ REST: create/list chats, paginated messages — Task 6
- ✅ Hub: JoinChat, LeaveChat, SendMessage, MarkRead — Task 5
- ✅ Participant authorization on every hub method — Task 5
- ✅ `ChatsPage` inbox — Task 9
- ✅ `ChatPage` real-time window — Task 10
- ✅ PostDetailsPage Chat button — Task 11
- ✅ Navbar update — Task 11
- ✅ Dashboard update — Task 11
- ✅ Remove all ContactRequest backend — Task 7
- ✅ Remove all ContactRequest frontend — Task 11
- ✅ frontend-design skill used for ChatsPage and ChatPage — Tasks 9, 10
- ✅ Race condition on chat creation handled — Task 3 (DbUpdateException catch)
- ✅ CORS AllowCredentials for SignalR negotiate — Task 6
