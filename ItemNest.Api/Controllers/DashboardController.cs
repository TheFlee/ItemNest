using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<MyDashboardDto>> GetMe()
    {
        var userId = GetCurrentUserId();
        var dashboard = await _dashboardService.GetMyDashboardAsync(userId);
        return Ok(dashboard);
    }

    [HttpGet("admin")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<AdminDashboardDto>> GetAdmin()
    {
        var dashboard = await _dashboardService.GetAdminDashboardAsync();
        return Ok(dashboard);
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