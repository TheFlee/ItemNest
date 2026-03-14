using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Exceptions;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class ItemPostService : IItemPostService
{
    private readonly ItemNestDbContext _context;
    private readonly IMapper _mapper;

    public ItemPostService(ItemNestDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PagedResponseDto<ItemPostDto>> GetAllAsync(ItemPostFilterDto filter)
    {
        IQueryable<ItemPost> query = _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Images);

        if (filter.Type.HasValue)
        {
            query = query.Where(x => x.Type == filter.Type.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(x => x.Status == filter.Status.Value);
        }

        if (filter.Color.HasValue)
        {
            query = query.Where(x => x.Color == filter.Color.Value);
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(x => x.CategoryId == filter.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            var location = filter.Location.Trim();
            query = query.Where(x => EF.Functions.Like(x.Location, $"%{location}%"));
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim();
            query = query.Where(x =>
                EF.Functions.Like(x.Title, $"%{search}%") ||
                EF.Functions.Like(x.Description, $"%{search}%"));
        }

        query = ApplySorting(query, filter.SortBy, filter.SortDirection);

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var itemDtos = _mapper.Map<List<ItemPostDto>>(items);

        return new PagedResponseDto<ItemPostDto>
        {
            Items = itemDtos,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
        };
    }

    public async Task<ItemPostDto> GetByIdAsync(Guid id)
    {
        var post = await _context.ItemPosts
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        return _mapper.Map<ItemPostDto>(post);
    }

    public async Task<ItemPostDto> CreateAsync(Guid userId, CreateItemPostDto dto)
    {
        var categoryExists = await _context.Categories.AnyAsync(x => x.Id == dto.CategoryId);
        if (!categoryExists)
            throw new KeyNotFoundException("Category not found.");

        var userExists = await _context.Users.AnyAsync(x => x.Id == userId);
        if (!userExists)
            throw new KeyNotFoundException("User not found.");

        var post = _mapper.Map<ItemPost>(dto);
        post.Id = Guid.NewGuid();
        post.UserId = userId;

        _context.ItemPosts.Add(post);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(post.Id);
    }

    public async Task<ItemPostDto> UpdateAsync(Guid userId, Guid id, UpdateItemPostDto dto)
    {
        var post = await _context.ItemPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new ForbiddenException("You are not allowed to update this post.");

        var categoryExists = await _context.Categories.AnyAsync(x => x.Id == dto.CategoryId);
        if (!categoryExists)
            throw new KeyNotFoundException("Category not found.");

        _mapper.Map(dto, post);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(post.Id);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var post = await _context.ItemPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new ForbiddenException("You are not allowed to delete this post.");

        _context.ItemPosts.Remove(post);
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<ItemPostDto>> GetMyPostsAsync(Guid userId)
    {
        var posts = await _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IReadOnlyList<ItemPostDto>>(posts);
    }

    private static IQueryable<ItemPost> ApplySorting(IQueryable<ItemPost> query, string? sortBy, string? sortDirection)
    {
        var normalizedSortBy = sortBy?.Trim().ToLower() ?? "createdat";
        var normalizedSortDirection = sortDirection?.Trim().ToLower() ?? "desc";

        var isAscending = normalizedSortDirection == "asc";

        return normalizedSortBy switch
        {
            "title" => isAscending
                ? query.OrderBy(x => x.Title)
                : query.OrderByDescending(x => x.Title),

            "eventdate" => isAscending
                ? query.OrderBy(x => x.EventDate)
                : query.OrderByDescending(x => x.EventDate),

            "createdat" or _ => isAscending
                ? query.OrderBy(x => x.CreatedAt)
                : query.OrderByDescending(x => x.CreatedAt)
        };
    }
}