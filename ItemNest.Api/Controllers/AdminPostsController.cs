using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ItemNest.Api.Controllers;

[Route("api/admin/posts")]
[ApiController]
[Authorize(Roles = AppRoles.Admin)]
public class AdminPostsController : ControllerBase
{
    private readonly IItemPostService _itemPostService;

    public AdminPostsController(IItemPostService itemPostService)
    {
        _itemPostService = itemPostService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ItemPostDto>>> GetAll()
    {
        var posts = await _itemPostService.GetAllForAdminAsync();
        return Ok(posts);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<ItemPostDto>> UpdateStatus(Guid id, [FromBody] AdminUpdatePostStatusDto dto)
    {
        var post = await _itemPostService.AdminUpdateStatusAsync(id, dto.Status);
        return Ok(post);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _itemPostService.AdminDeleteAsync(id);
        return NoContent();
    }
}

public class AdminUpdatePostStatusDto
{
    public PostStatus Status { get; set; }
}