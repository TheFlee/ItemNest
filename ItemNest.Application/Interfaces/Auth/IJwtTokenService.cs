using ItemNest.Domain.Entities;

namespace ItemNest.Application.Interfaces.Auth;

public interface IJwtTokenService
{
    string GenerateToken(AppUser user, IList<string>? roles = null);
    DateTimeOffset GetTokenExpiration();
}
