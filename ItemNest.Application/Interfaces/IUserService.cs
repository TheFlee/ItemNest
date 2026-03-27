using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IUserService
{
    Task<CurrentUserDto> GetCurrentUserAsync(Guid userId);
}
