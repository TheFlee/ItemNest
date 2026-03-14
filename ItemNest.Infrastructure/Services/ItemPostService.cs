using AutoMapper;
using ItemNest.Application.DTOs;
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

    public async Task<IReadOnlyList<ItemPostDto>> GetAllAsync(ItemPostFilterDto filter)
    {
        var query = _context.ItemPosts
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images)
            .AsQueryable();

        if (filter.Type.HasValue)
            query = query.Where(x => x.Type == filter.Type.Value);

        if (filter.Status.HasValue)
            query = query.Where(x => x.Status == filter.Status.Value);

        if (filter.Color.HasValue)
            query = query.Where(x => x.Color == filter.Color.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(x => x.CategoryId == filter.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            var location = filter.Location.Trim().ToLower();
            query = query.Where(x => x.Location.ToLower().Contains(location));
        }

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var search = filter.SearchTerm.Trim().ToLower();
            query = query.Where(x =>
                x.Title.ToLower().Contains(search) ||
                x.Description.ToLower().Contains(search));
        }

        var posts = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return _mapper.Map<IReadOnlyList<ItemPostDto>>(posts);
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
        ValidateCreateDto(dto);

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
        ValidateUpdateDto(dto);

        var post = await _context.ItemPosts.FirstOrDefaultAsync(x => x.Id == id);
        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("You are not allowed to update this post.");

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
            throw new UnauthorizedAccessException("You are not allowed to delete this post.");

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

    private static void ValidateCreateDto(CreateItemPostDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Description))
            throw new ArgumentException("Description cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Location))
            throw new ArgumentException("Location cannot be empty.");

        if (dto.CategoryId <= 0)
            throw new ArgumentException("Invalid category ID.");
    }

    private static void ValidateUpdateDto(UpdateItemPostDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new ArgumentException("Title cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Description))
            throw new ArgumentException("Description cannot be empty.");

        if (string.IsNullOrWhiteSpace(dto.Location))
            throw new ArgumentException("Location cannot be empty.");

        if (dto.CategoryId <= 0)
            throw new ArgumentException("Invalid category ID.");
    }
}