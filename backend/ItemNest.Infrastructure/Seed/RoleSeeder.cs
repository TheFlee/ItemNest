using Microsoft.AspNetCore.Identity;

namespace ItemNest.Infrastructure.Seed;

public static class RoleSeeder
{
    public static async Task SeedAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        string[] roles =
        [
            AppRoles.Admin,
            AppRoles.User
        ];

        foreach (var role in roles)
        {
            var exists = await roleManager.RoleExistsAsync(role);

            if (!exists)
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }
    }
}