using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryDto>> GetAllAsync();
    Task<CategoryDto> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task DeleteAsync(int id);
}
