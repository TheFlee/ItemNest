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
    private readonly IJwtTokenService _jwtTokenService;

    public UserService(
        ItemNestDbContext context,
        UserManager<AppUser> userManager,
        IJwtTokenService jwtTokenService)
    {
        _context = context;
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
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
            IsBlocked = user.IsBlocked,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<AuthResponseDto> UpdateEmailAsync(Guid userId, UpdateUserEmailDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NewEmail))
            throw new ArgumentException("New email is required.");

        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            throw new ArgumentException("Current password is required.");

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            throw new KeyNotFoundException("User not found.");

        if (user.IsBlocked)
            throw new UnauthorizedAccessException("This account is blocked.");

        var newEmail = dto.NewEmail.Trim();

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
        if (!isPasswordValid)
            throw new InvalidOperationException("Current password is incorrect.");

        if (string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("The new email must be different from the current email.");

        var existingUser = await _userManager.FindByEmailAsync(newEmail);
        if (existingUser is not null && existingUser.Id != user.Id)
            throw new InvalidOperationException("This email is already in use.");

        var emailToken = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
        var emailResult = await _userManager.ChangeEmailAsync(user, newEmail, emailToken);

        if (!emailResult.Succeeded)
        {
            var errors = string.Join("; ", emailResult.Errors.Select(x => x.Description));
            throw new InvalidOperationException($"Failed to update email. {errors}");
        }

        var userNameResult = await _userManager.SetUserNameAsync(user, newEmail);
        if (!userNameResult.Succeeded)
        {
            var errors = string.Join("; ", userNameResult.Errors.Select(x => x.Description));
            throw new InvalidOperationException($"Failed to update username. {errors}");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwtTokenService.GenerateToken(user, roles);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Roles = roles.ToList(),
            ExpiresAt = _jwtTokenService.GetTokenExpiration()
        };
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            throw new ArgumentException("Current password is required.");

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            throw new ArgumentException("New password is required.");

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            throw new KeyNotFoundException("User not found.");

        if (user.IsBlocked)
            throw new UnauthorizedAccessException("This account is blocked.");

        var isSamePassword = await _userManager.CheckPasswordAsync(user, dto.NewPassword);
        if (isSamePassword)
            throw new InvalidOperationException("The new password must be different from the current password.");

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(x => x.Description));
            throw new InvalidOperationException(errors);
        }
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
                IsBlocked = user.IsBlocked,
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
            IsBlocked = user.IsBlocked,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<AdminUserDto> AdminUpdateBlockStatusAsync(Guid currentAdminUserId, Guid targetUserId, bool isBlocked)
    {
        if (currentAdminUserId == targetUserId && isBlocked)
            throw new InvalidOperationException("You cannot block your own account.");

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == targetUserId);

        if (user is null)
            throw new KeyNotFoundException("User not found.");

        user.IsBlocked = isBlocked;
        await _context.SaveChangesAsync();

        var updatedRoles = await _userManager.GetRolesAsync(user);

        return new AdminUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Roles = updatedRoles.ToList(),
            IsBlocked = user.IsBlocked,
            CreatedAt = user.CreatedAt
        };
    }
}