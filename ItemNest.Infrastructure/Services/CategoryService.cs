using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ItemNestDbContext _context;
    private readonly IMapper _mapper;

    public CategoryService(ItemNestDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync();

        return _mapper.Map<IReadOnlyList<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> GetByIdAsync(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category is null)
            throw new KeyNotFoundException("Kateqoriya tapılmadı.");

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Kateqoriya adı boş ola bilməz.");

        var normalizedName = dto.Name.Trim();

        var exists = await _context.Categories
            .AnyAsync(x => x.Name.ToLower() == normalizedName.ToLower());

        if (exists)
            throw new InvalidOperationException("Bu kateqoriya artıq mövcuddur.");

        var category = _mapper.Map<Category>(dto);

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
            throw new KeyNotFoundException("Kateqoriya tapılmadı.");

        var isUsed = await _context.ItemPosts.AnyAsync(x => x.CategoryId == id);

        if (isUsed)
            throw new InvalidOperationException("Bu kateqoriya istifadə olunduğu üçün silinə bilməz.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
}

