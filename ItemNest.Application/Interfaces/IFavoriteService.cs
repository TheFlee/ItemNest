using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IFavoriteService
{
    Task AddAsync(Guid userId, Guid itemPostId);
    Task RemoveAsync(Guid userId, Guid itemPostId);
    Task<IReadOnlyList<FavoriteDto>> GetMyFavoritesAsync(Guid userId);
}