using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ItemNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        return Ok(category);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryDto dto)
    {
        var createdCategory = await _categoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = createdCategory.Id }, createdCategory);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        await _categoryService.DeleteAsync(id);
        return NoContent();
    }
}
