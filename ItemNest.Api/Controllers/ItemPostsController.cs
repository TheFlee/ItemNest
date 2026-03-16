using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ItemPostsController : ControllerBase
{
    private readonly IItemPostService _itemPostService;

    public ItemPostsController(IItemPostService itemPostService)
    {
        _itemPostService = itemPostService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponseDto<ItemPostDto>>> GetAll([FromQuery] ItemPostFilterDto filter)
    {
        var posts = await _itemPostService.GetAllAsync(filter);
        return Ok(posts);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ItemPostDto>> GetById(Guid id)
    {
        var post = await _itemPostService.GetByIdAsync(id);
        return Ok(post);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<ItemPostDto>>> GetMyPosts()
    {
        var userId = GetCurrentUserId();
        var posts = await _itemPostService.GetMyPostsAsync(userId);
        return Ok(posts);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ItemPostDto>> Create(CreateItemPostDto dto)
    {
        var userId = GetCurrentUserId();
        var createdPost = await _itemPostService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = createdPost.Id }, createdPost);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ItemPostDto>> Update(Guid id, UpdateItemPostDto dto)
    {
        var userId = GetCurrentUserId();
        var updatedPost = await _itemPostService.UpdateAsync(userId, id, dto);
        return Ok(updatedPost);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        await _itemPostService.DeleteAsync(userId, id);
        return NoContent();
    }

    [HttpGet("{id:guid}/matches")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyCollection<MatchedItemPostDto>>> GetMatches(Guid id)
    {
        var matches = await _itemPostService.GetMatchesAsync(id);
        return Ok(matches);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? User.FindFirstValue(ClaimTypes.Name)
                         ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("User information was not found in the token.");

        return Guid.Parse(userIdClaim);
    }
}
