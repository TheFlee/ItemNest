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

        if (!Guid.TryParse(claim, out var userId))
            throw new HubException("Invalid user identifier.");
        return userId;
    }
}
