using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ItemNestDbContext _context;
    private readonly UserManager<ItemNest.Domain.Entities.AppUser> _userManager;

    public UserService(
        ItemNestDbContext context,
        UserManager<ItemNest.Domain.Entities.AppUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<CurrentUserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
            throw new KeyNotFoundException("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return new CurrentUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToList(),
            CreatedAt = user.CreatedAt
        };
    }
}
