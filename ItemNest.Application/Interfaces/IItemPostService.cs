using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IItemPostService
{
    Task<PagedResponseDto<ItemPostDto>> GetAllAsync(ItemPostFilterDto filter);
    Task<ItemPostDto> GetByIdAsync(Guid id);
    Task<ItemPostDto> CreateAsync(Guid userId, CreateItemPostDto dto);
    Task<ItemPostDto> UpdateAsync(Guid userId, Guid id, UpdateItemPostDto dto);
    Task DeleteAsync(Guid userId, Guid id);
    Task<IReadOnlyList<ItemPostDto>> GetMyPostsAsync(Guid userId);
    Task<IReadOnlyCollection<MatchedItemPostDto>> GetMatchesAsync(Guid postId);
}
