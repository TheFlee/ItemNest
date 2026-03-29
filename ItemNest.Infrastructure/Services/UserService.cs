using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ItemNestDbContext _context;
    private readonly UserManager<AppUser> _userManager;

    public UserService(
        ItemNestDbContext context,
        UserManager<AppUser> userManager)
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

    public async Task<IReadOnlyList<AdminUserDto>> GetAllForAdminAsync()
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var result = new List<AdminUserDto>(users.Count);

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            result.Add(new AdminUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Roles = roles.ToList(),
                CreatedAt = user.CreatedAt
            });
        }

        return result;
    }

    public async Task<AdminUserDto> AdminUpdateRoleAsync(Guid currentAdminUserId, Guid targetUserId, string role)
    {
        if (string.IsNullOrWhiteSpace(role))
            throw new ArgumentException("Role is required.");

        var normalizedRole = role.Trim();

        if (normalizedRole != AppRoles.Admin && normalizedRole != AppRoles.User)
            throw new ArgumentException("Invalid role.");

        if (currentAdminUserId == targetUserId && normalizedRole != AppRoles.Admin)
            throw new InvalidOperationException("You cannot remove your own admin role.");

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == targetUserId);

        if (user is null)
            throw new KeyNotFoundException("User not found.");

        var currentRoles = await _userManager.GetRolesAsync(user);

        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                var errors = string.Join("; ", removeResult.Errors.Select(x => x.Description));
                throw new InvalidOperationException($"Failed to remove existing roles. {errors}");
            }
        }

        var addResult = await _userManager.AddToRoleAsync(user, normalizedRole);
        if (!addResult.Succeeded)
        {
            var errors = string.Join("; ", addResult.Errors.Select(x => x.Description));
            throw new InvalidOperationException($"Failed to assign role. {errors}");
        }

        var updatedRoles = await _userManager.GetRolesAsync(user);

        return new AdminUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Roles = updatedRoles.ToList(),
            CreatedAt = user.CreatedAt
        };
    }
}