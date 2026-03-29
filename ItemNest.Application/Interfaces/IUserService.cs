using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IUserService
{
    Task<CurrentUserDto> GetCurrentUserAsync(Guid userId);

    Task<IReadOnlyList<AdminUserDto>> GetAllForAdminAsync();
    Task<AdminUserDto> AdminUpdateRoleAsync(Guid currentAdminUserId, Guid targetUserId, string role);
}