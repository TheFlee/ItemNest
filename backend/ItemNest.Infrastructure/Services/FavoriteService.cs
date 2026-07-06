using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class FavoriteService : IFavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IItemPostRepository _itemPostRepository;

    public FavoriteService(IFavoriteRepository favoriteRepository, IItemPostRepository itemPostRepository)
    {
        _favoriteRepository = favoriteRepository;
        _itemPostRepository = itemPostRepository;
    }

    public async Task AddAsync(Guid userId, Guid itemPostId)
    {
        var post = await _itemPostRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == itemPostId);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId == userId)
            throw new InvalidOperationException("You cannot add your own post to favorites.");

        var exists = await _favoriteRepository.AnyAsync(
            x => x.UserId == userId && x.ItemPostId == itemPostId);

        if (exists)
            throw new InvalidOperationException("This post is already in favorites.");

        var favorite = new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ItemPostId = itemPostId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _favoriteRepository.AddAsync(favorite);
        await _favoriteRepository.SaveChangesAsync();
    }

    public async Task RemoveAsync(Guid userId, Guid itemPostId)
    {
        var favorite = await _favoriteRepository.FindByUserAndPostAsync(userId, itemPostId);

        if (favorite is null)
            throw new KeyNotFoundException("Favorite not found.");

        _favoriteRepository.Delete(favorite);
        await _favoriteRepository.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<FavoriteDto>> GetMyFavoritesAsync(Guid userId)
    {
        var favorites = await _favoriteRepository.QueryWithDetails()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return favorites.Select(x => new FavoriteDto
        {
            Id = x.Id,
            ItemPostId = x.ItemPostId,
            Title = x.ItemPost.Title,
            CategoryName = x.ItemPost.Category.Name,
            FirstImageUrl = x.ItemPost.Images.FirstOrDefault()?.ImageUrl ?? string.Empty,
            CreatedAt = x.CreatedAt
        }).ToList();
    }

    public async Task<FavoriteStatusDto> GetStatusAsync(Guid userId, Guid itemPostId)
    {
        var postExists = await _itemPostRepository.AnyAsync(x => x.Id == itemPostId);

        if (!postExists)
            throw new KeyNotFoundException("Post not found.");

        var isFavorited = await _favoriteRepository.AnyAsync(
            x => x.UserId == userId && x.ItemPostId == itemPostId);

        return new FavoriteStatusDto
        {
            ItemPostId = itemPostId,
            IsFavorited = isFavorited
        };
    }
}
