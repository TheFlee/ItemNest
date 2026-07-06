using ItemNest.Application.Configurations;
using ItemNest.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace ItemNest.Infrastructure.Seed;

public class AdminUserSeeder
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IOptions<AdminSeedSettings> _adminSettings;

    public AdminUserSeeder(
        UserManager<AppUser> userManager,
        IOptions<AdminSeedSettings> adminSettings)
    {
        _userManager = userManager;
        _adminSettings = adminSettings;
    }

    public async Task SeedAsync()
    {
        var settings = _adminSettings.Value;

        if (string.IsNullOrWhiteSpace(settings.Email) ||
            string.IsNullOrWhiteSpace(settings.Password) ||
            string.IsNullOrWhiteSpace(settings.FullName))
        {
            throw new InvalidOperationException("Admin seed settings are missing or invalid.");
        }

        var existingUser = await _userManager.FindByEmailAsync(settings.Email);
        if (existingUser is not null)
        {
            var isInRole = await _userManager.IsInRoleAsync(existingUser, AppRoles.Admin);

            if (!isInRole)
            {
                await _userManager.AddToRoleAsync(existingUser, AppRoles.Admin);
            }

            return;
        }

        var adminUser = new AppUser
        {
            UserName = settings.Email,
            Email = settings.Email,
            FullName = settings.FullName,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(adminUser, settings.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(x => x.Description));
            throw new InvalidOperationException($"Failed to seed admin user. {errors}");
        }

        await _userManager.AddToRoleAsync(adminUser, AppRoles.Admin);
    }
}
