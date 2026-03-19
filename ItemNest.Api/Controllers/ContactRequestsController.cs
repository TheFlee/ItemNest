using ItemNest.Application.DTOs;
using ItemNest.Application.Exceptions;
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ContactRequestsController : ControllerBase
{
    private readonly IContactRequestService _contactRequestService;

    public ContactRequestsController(IContactRequestService contactRequestService)
    {
        _contactRequestService = contactRequestService;
    }

    [HttpPost]
    public async Task<ActionResult<ContactRequestDto>> Create(CreateContactRequestDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _contactRequestService.CreateAsync(userId, dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpGet("sent")]
    public async Task<ActionResult<IReadOnlyCollection<ContactRequestDto>>> GetSent()
    {
        var userId = GetCurrentUserId();
        var result = await _contactRequestService.GetSentAsync(userId);
        return Ok(result);
    }

    [HttpGet("received")]
    public async Task<ActionResult<IReadOnlyCollection<ContactRequestDto>>> GetReceived()
    {
        var userId = GetCurrentUserId();
        var result = await _contactRequestService.GetReceivedAsync(userId);
        return Ok(result);
    }

    [HttpPut("{id:guid}/accept")]
    public async Task<ActionResult<ContactRequestDto>> Accept(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _contactRequestService.AcceptAsync(id, userId);
        return Ok(result);
    }

    [HttpPut("{id:guid}/reject")]
    public async Task<ActionResult<ContactRequestDto>> Reject(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _contactRequestService.RejectAsync(id, userId);
        return Ok(result);
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<ActionResult<ContactRequestDto>> Cancel(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _contactRequestService.CancelAsync(id, userId);
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new ForbiddenException("User information was not found in the token.");

        return Guid.Parse(userIdClaim);
    }
}
