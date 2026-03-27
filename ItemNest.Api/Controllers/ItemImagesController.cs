using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api")]
[ApiController]
public class ItemImagesController : ControllerBase
{
    private readonly IItemImageService _itemImageService;

    public ItemImagesController(IItemImageService itemImageService)
    {
        _itemImageService = itemImageService;
    }

    [HttpPost("itemposts/{itemPostId:guid}/images")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ItemImageDto>> Upload(
        Guid itemPostId,
        [FromForm] UploadItemImageDto request,
        CancellationToken cancellationToken)
    {
        if (request.File is null || request.File.Length == 0)
            throw new ArgumentException("Image file cannot be empty.");

        var userId = GetCurrentUserId();

        await using var stream = request.File.OpenReadStream();

        var result = await _itemImageService.UploadAsync(
            itemPostId,
            stream,
            request.File.FileName,
            request.File.ContentType,
            request.File.Length,
            userId,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("itemposts/{itemPostId:guid}/images")]
    public async Task<ActionResult<IReadOnlyList<ItemImageDto>>> GetByPostId(
        Guid itemPostId,
        CancellationToken cancellationToken)
    {
        var result = await _itemImageService.GetByPostIdAsync(itemPostId, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("itemimages/{imageId:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(
        Guid imageId,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        await _itemImageService.DeleteAsync(imageId, userId, cancellationToken);
        return NoContent();
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