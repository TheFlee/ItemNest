using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class FavoriteService : IFavoriteService
{
    private readonly ItemNestDbContext _context;
    private readonly IMapper _mapper;

    public FavoriteService(ItemNestDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task AddAsync(Guid userId, Guid itemPostId)
    {
        var post = await _context.ItemPosts
            .FirstOrDefaultAsync(x => x.Id == itemPostId);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId == userId)
            throw new InvalidOperationException("You cannot add your own post to favorites.");

        var exists = await _context.Favorites
            .AnyAsync(x => x.UserId == userId && x.ItemPostId == itemPostId);

        if (exists)
            throw new InvalidOperationException("This post is already in favorites.");

        var favorite = new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ItemPostId = itemPostId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.Favorites.Add(favorite);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(Guid userId, Guid itemPostId)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(x => x.UserId == userId && x.ItemPostId == itemPostId);

        if (favorite is null)
            throw new KeyNotFoundException("Favorite not found.");

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<FavoriteDto>> GetMyFavoritesAsync(Guid userId)
    {
        var favorites = await _context.Favorites
            .Include(x => x.ItemPost)
                .ThenInclude(p => p.Category)
            .Include(x => x.ItemPost)
                .ThenInclude(p => p.Images)
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
}