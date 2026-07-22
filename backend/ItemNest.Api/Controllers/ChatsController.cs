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
