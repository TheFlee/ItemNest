using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReportDto>> Create(CreateReportDto dto)
    {
        var userId = GetCurrentUserId();
        var createdReport = await _reportService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetMyReports), new { }, createdReport);
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyCollection<ReportDto>>> GetMyReports()
    {
        var userId = GetCurrentUserId();
        var reports = await _reportService.GetMyReportsAsync(userId);
        return Ok(reports);
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<IReadOnlyCollection<ReportDto>>> GetAll()
    {
        var reports = await _reportService.GetAllAsync();
        return Ok(reports);
    }

    [HttpPut("{id:guid}/review")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<ReportDto>> Review(Guid id, ReviewReportDto dto)
    {
        var adminUserId = GetCurrentUserId();
        var reviewedReport = await _reportService.ReviewAsync(id, adminUserId, dto);
        return Ok(reviewedReport);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("User information was not found in the token.");

        return Guid.Parse(userIdClaim);
    }
}
