using Google.Apis.Auth;
using ItemNest.Application.Configurations;
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace ItemNest.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly GoogleAuthSettings _googleAuthSettings;

    public AuthService(
        UserManager<AppUser> userManager,
        IJwtTokenService jwtTokenService,
        IOptions<GoogleAuthSettings> googleAuthOptions)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _googleAuthSettings = googleAuthOptions.Value;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            throw new ArgumentException("Full name cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ArgumentException("Email cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("Password cannot be empty.");

        var normalizedEmail = dto.Email.Trim();

        var existingUser = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existingUser is not null)
            throw new InvalidOperationException("This email is already in use.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName.Trim(),
            Email = normalizedEmail,
            UserName = normalizedEmail,
            IsBlocked = false,
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

        if (user.IsBlocked)
            throw new UnauthorizedAccessException("This account is blocked.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
            throw new InvalidOperationException("Incorrect email or password.");

        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(_googleAuthSettings.ClientId))
            throw new InvalidOperationException("Google authentication is not configured.");

        if (string.IsNullOrWhiteSpace(dto.IdToken))
            throw new ArgumentException("Google ID token cannot be empty.");

        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                dto.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [_googleAuthSettings.ClientId]
                });
        }
        catch
        {
            throw new InvalidOperationException("Google authentication failed.");
        }

        if (!payload.EmailVerified)
            throw new InvalidOperationException("Google account email is not verified.");

        if (string.IsNullOrWhiteSpace(payload.Email))
            throw new InvalidOperationException("Google account email was not provided.");

        var normalizedEmail = payload.Email.Trim();
        var user = await _userManager.FindByEmailAsync(normalizedEmail);

        if (user is null)
        {
            var fullName = string.IsNullOrWhiteSpace(payload.Name)
                ? normalizedEmail
                : payload.Name.Trim();

            user = new AppUser
            {
                Id = Guid.NewGuid(),
                FullName = fullName,
                Email = normalizedEmail,
                UserName = normalizedEmail,
                IsBlocked = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);

            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(x => x.Description));
                throw new InvalidOperationException(errors);
            }

            await _userManager.AddToRoleAsync(user, AppRoles.User);
        }
        else
        {
            if (user.IsBlocked)
                throw new UnauthorizedAccessException("This account is blocked.");

            if (string.IsNullOrWhiteSpace(user.FullName) && !string.IsNullOrWhiteSpace(payload.Name))
            {
                user.FullName = payload.Name.Trim();
                await _userManager.UpdateAsync(user);
            }
        }

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