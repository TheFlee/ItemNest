using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IItemPostService
{
    Task<PagedResponseDto<ItemPostDto>> GetAllAsync(ItemPostFilterDto filter, Guid? currentUserId = null);
    Task<ItemPostDto> GetByIdAsync(Guid id, Guid? currentUserId = null);
    Task<ItemPostDto> CreateAsync(Guid userId, CreateItemPostDto dto);
    Task<ItemPostDto> UpdateAsync(Guid userId, Guid id, UpdateItemPostDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<IReadOnlyList<ItemPostDto>> GetMyPostsAsync(Guid userId);
    Task<IReadOnlyCollection<MatchedItemPostDto>> GetMatchesAsync(Guid postId);
}