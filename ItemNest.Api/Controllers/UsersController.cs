using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Infrastructure.Seed;
using ItemNest.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserDto>> GetMe()
    {
        var userId = GetCurrentUserId();
        var user = await _userService.GetCurrentUserAsync(userId);
        return Ok(user);
    }

    [HttpPut("me/email")]
    public async Task<ActionResult<AuthResponseDto>> UpdateMyEmail([FromBody] UpdateUserEmailDto dto)
    {
        var userId = GetCurrentUserId();
        var response = await _userService.UpdateEmailAsync(userId, dto);
        return Ok(response);
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangeMyPassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetCurrentUserId();
        await _userService.ChangePasswordAsync(userId, dto);
        return NoContent();
    }

    [HttpGet("admin")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<IReadOnlyList<AdminUserDto>>> GetAllForAdmin()
    {
        var users = await _userService.GetAllForAdminAsync();
        return Ok(users);
    }

    [HttpPut("admin/{id:guid}/role")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<AdminUserDto>> UpdateRole(Guid id, [FromBody] AdminUpdateUserRoleDto dto)
    {
        var currentAdminUserId = GetCurrentUserId();
        var user = await _userService.AdminUpdateRoleAsync(currentAdminUserId, id, dto.Role);
        return Ok(user);
    }

    [HttpPut("admin/{id:guid}/block-status")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<AdminUserDto>> UpdateBlockStatus(Guid id, [FromBody] AdminUpdateUserBlockStatusDto dto)
    {
        var currentAdminUserId = GetCurrentUserId();
        var user = await _userService.AdminUpdateBlockStatusAsync(currentAdminUserId, id, dto.IsBlocked);
        return Ok(user);
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