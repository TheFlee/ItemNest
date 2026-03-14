using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;


[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpPost("{itemPostId:guid}")]
    public async Task<IActionResult> Add(Guid itemPostId)
    {
        var userId = GetUserId();
        await _favoriteService.AddAsync(userId, itemPostId);
        return Ok();
    }

    [HttpDelete("{itemPostId:guid}")]
    public async Task<IActionResult> Remove(Guid itemPostId)
    {
        var userId = GetUserId();
        await _favoriteService.RemoveAsync(userId, itemPostId);
        return NoContent();
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<FavoriteDto>>> GetMy()
    {
        var userId = GetUserId();
        var favorites = await _favoriteService.GetMyFavoritesAsync(userId);
        return Ok(favorites);
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("sub");

        return Guid.Parse(id!);
    }
}
