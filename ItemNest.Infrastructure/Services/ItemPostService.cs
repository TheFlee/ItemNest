using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Exceptions;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
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

    public async Task<PagedResponseDto<ItemPostDto>> GetAllAsync(ItemPostFilterDto filter, Guid? currentUserId = null)
    {
        IQueryable<ItemPost> query = _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images);

        if (filter.Type.HasValue)
        {
            query = query.Where(x => x.Type == filter.Type.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(x => x.Status == filter.Status.Value);
        }
        else
        {
            query = query.Where(x => x.Status == PostStatus.Open);
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

        await EnrichPostDtosAsync(itemDtos, currentUserId);

        return new PagedResponseDto<ItemPostDto>
        {
            Items = itemDtos,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
        };
    }

    public async Task<ItemPostDto> GetByIdAsync(Guid id, Guid? currentUserId = null)
    {
        var post = await _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        var dto = _mapper.Map<ItemPostDto>(post);
        await EnrichPostDtosAsync([dto], currentUserId);

        return dto;
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

        return await GetByIdAsync(post.Id, userId);
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

        return await GetByIdAsync(post.Id, userId);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var post = await _context.ItemPosts
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new ForbiddenException("You are not allowed to delete this post.");

        await DeletePostRelationsAndPostAsync(post);

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

        var dtos = _mapper.Map<List<ItemPostDto>>(posts);
        await EnrichPostDtosAsync(dtos, userId);

        return dtos;
    }

    public async Task<IReadOnlyCollection<MatchedItemPostDto>> GetMatchesAsync(Guid postId)
    {
        var sourcePost = await _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == postId);

        if (sourcePost is null)
            throw new KeyNotFoundException("Item post not found.");

        var oppositeType = sourcePost.Type == PostType.Lost
            ? PostType.Found
            : PostType.Lost;

        var minDate = sourcePost.EventDate.Date.AddDays(-30);
        var maxDate = sourcePost.EventDate.Date.AddDays(30);

        var candidatePosts = await _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Images)
            .Where(x => x.Id != sourcePost.Id)
            .Where(x => x.UserId != sourcePost.UserId)
            .Where(x => x.Type == oppositeType)
            .Where(x => x.CategoryId == sourcePost.CategoryId)
            .Where(x => x.EventDate >= minDate && x.EventDate <= maxDate)
            .Where(x => x.Status == PostStatus.Open)
            .ToListAsync();

        var matches = new List<MatchedItemPostDto>();

        foreach (var candidate in candidatePosts)
        {
            var score = 0;
            var reasons = new List<string>();

            var hasSameCategory = candidate.CategoryId == sourcePost.CategoryId;
            var hasSameColor = candidate.Color == sourcePost.Color;
            var hasSimilarLocation = IsSimilarLocation(sourcePost.Location, candidate.Location);

            var dayDifference = Math.Abs((candidate.EventDate.Date - sourcePost.EventDate.Date).Days);
            var hasCloseDate = dayDifference <= 3;

            if (!hasSameCategory)
                continue;

            if (!hasSimilarLocation && !hasCloseDate)
                continue;

            if (hasSameCategory)
            {
                score += 40;
                reasons.Add("Same category");
            }

            if (hasSameColor)
            {
                score += 20;
                reasons.Add("Same color");
            }

            if (hasSimilarLocation)
            {
                score += 25;
                reasons.Add("Similar location");
            }

            if (hasCloseDate)
            {
                score += 15;
                reasons.Add("Close event date");
            }

            if (score == 0)
                continue;

            matches.Add(new MatchedItemPostDto
            {
                Id = candidate.Id,
                Title = candidate.Title,
                Description = candidate.Description,
                Location = candidate.Location,
                EventDate = candidate.EventDate,
                CategoryId = candidate.CategoryId,
                CategoryName = candidate.Category.Name,
                MatchScore = score,
                MatchReasons = reasons,
                Images = _mapper.Map<List<ItemImageDto>>(candidate.Images)
            });
        }

        return matches
            .OrderByDescending(x => x.MatchScore)
            .ThenByDescending(x => x.EventDate)
            .Take(10)
            .ToList();
    }

    public async Task<IReadOnlyList<ItemPostDto>> GetAllForAdminAsync()
    {
        var posts = await _context.ItemPosts
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var dtos = _mapper.Map<List<ItemPostDto>>(posts);
        await EnrichPostDtosAsync(dtos, null);

        return dtos;
    }

    public async Task<ItemPostDto> AdminUpdateStatusAsync(Guid id, PostStatus status)
    {
        var post = await _context.ItemPosts.FirstOrDefaultAsync(x => x.Id == id);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        post.Status = status;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(post.Id, null);
    }

    public async Task AdminDeleteAsync(Guid id)
    {
        var post = await _context.ItemPosts
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        await DeletePostRelationsAndPostAsync(post);

        await _context.SaveChangesAsync();
    }

    private async Task DeletePostRelationsAndPostAsync(ItemPost post)
    {
        var favorites = await _context.Favorites
            .Where(x => x.ItemPostId == post.Id)
            .ToListAsync();

        var reports = await _context.Reports
            .Where(x => x.ItemPostId == post.Id)
            .ToListAsync();

        var contactRequests = await _context.ContactRequests
            .Where(x => x.ItemPostId == post.Id)
            .ToListAsync();

        var images = await _context.ItemImages
            .Where(x => x.ItemPostId == post.Id)
            .ToListAsync();

        if (favorites.Count > 0)
        {
            _context.Favorites.RemoveRange(favorites);
        }

        if (reports.Count > 0)
        {
            _context.Reports.RemoveRange(reports);
        }

        if (contactRequests.Count > 0)
        {
            _context.ContactRequests.RemoveRange(contactRequests);
        }

        if (images.Count > 0)
        {
            _context.ItemImages.RemoveRange(images);
        }

        _context.ItemPosts.Remove(post);
    }

    private async Task EnrichPostDtosAsync(List<ItemPostDto> posts, Guid? currentUserId)
    {
        if (posts.Count == 0)
            return;

        foreach (var post in posts)
        {
            post.PrimaryImageUrl = post.Images.FirstOrDefault()?.ImageUrl ?? string.Empty;
            post.IsOwner = currentUserId.HasValue && post.UserId == currentUserId.Value;
            post.IsFavorited = false;
        }

        if (!currentUserId.HasValue)
            return;

        var postIds = posts.Select(x => x.Id).ToList();

        var favoritedPostIds = await _context.Favorites
            .AsNoTracking()
            .Where(x => x.UserId == currentUserId.Value && postIds.Contains(x.ItemPostId))
            .Select(x => x.ItemPostId)
            .ToListAsync();

        var favoriteSet = favoritedPostIds.ToHashSet();

        foreach (var post in posts)
        {
            post.IsFavorited = favoriteSet.Contains(post.Id);
        }
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

    private static bool IsSimilarLocation(string sourceLocation, string candidateLocation)
    {
        if (string.IsNullOrWhiteSpace(sourceLocation) || string.IsNullOrWhiteSpace(candidateLocation))
            return false;

        var source = sourceLocation.Trim().ToLowerInvariant();
        var candidate = candidateLocation.Trim().ToLowerInvariant();

        return source.Contains(candidate) || candidate.Contains(source);
    }
}