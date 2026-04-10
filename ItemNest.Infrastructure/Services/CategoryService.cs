using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.Query()
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync();

        return _mapper.Map<IReadOnlyList<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> GetByIdAsync(int id)
    {
        var category = await _categoryRepository.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category is null)
            throw new KeyNotFoundException("Category not found.");

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Category name cannot be empty.");

        if (await _categoryRepository.IsNameTakenAsync(dto.Name))
            throw new InvalidOperationException("This category already exists.");

        var category = _mapper.Map<Category>(dto);

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Category name cannot be empty.");

        var category = await _categoryRepository.FindAsync(id);

        if (category is null)
            throw new KeyNotFoundException("Category not found.");

        if (await _categoryRepository.IsNameTakenAsync(dto.Name, excludeId: id))
            throw new InvalidOperationException("This category already exists.");

        category.Name = dto.Name.Trim();

        await _categoryRepository.SaveChangesAsync();

        return _mapper.Map<CategoryDto>(category);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _categoryRepository.FindAsync(id);

        if (category is null)
            throw new KeyNotFoundException("Category not found.");

        if (await _categoryRepository.IsUsedByPostsAsync(id))
            throw new InvalidOperationException("This category cannot be deleted because it is in use.");

        _categoryRepository.Delete(category);
        await _categoryRepository.SaveChangesAsync();
    }
}
