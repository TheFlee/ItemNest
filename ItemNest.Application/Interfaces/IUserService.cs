using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IUserService
{
    Task<CurrentUserDto> GetCurrentUserAsync(Guid userId);
    Task<AuthResponseDto> UpdateEmailAsync(Guid userId, UpdateUserEmailDto dto);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<IReadOnlyList<AdminUserDto>> GetAllForAdminAsync();
    Task<AdminUserDto> AdminUpdateRoleAsync(Guid currentAdminUserId, Guid targetUserId, string role);
    Task<AdminUserDto> AdminUpdateBlockStatusAsync(Guid currentAdminUserId, Guid targetUserId, bool isBlocked);
}