using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;

namespace ItemNest.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        UserManager<AppUser> userManager,
        IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("Full name cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("Password cannot be empty.");

        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser is not null)
            throw new InvalidOperationException("This email is already in use.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim(),
            UserName = dto.Email.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(x => x.Description));
            throw new InvalidOperationException(errors);
        }

        await _userManager.AddToRoleAsync(user, AppRoles.User);
        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("Password cannot be empty.");

        var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
        if (user is null)
            throw new InvalidOperationException("Incorrect email or password.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
            throw new InvalidOperationException("Incorrect email or password.");

        return await CreateAuthResponseAsync(user);
    }

    private async Task<AuthResponseDto> CreateAuthResponseAsync(AppUser user)
    {
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
}