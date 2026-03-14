namespace ItemNest.Application.DTOs;

/// <summary>
/// Response model representing a category.
/// </summary>
public class CategoryDto
{
    /// <summary>
    /// Unique identifier of the category.
    /// </summary>
    /// <example>1</example>
    public int Id { get; set; }

    /// <summary>
    /// Name of the category.
    /// </summary>
    /// <example>Wallet</example>
    public string Name { get; set; } = string.Empty;
}

/// <summary>
/// Request model for creating a new category.
/// </summary>
public class CreateCategoryDto
{
    /// <summary>
    /// Name of the new category.
    /// </summary>
    /// <example>Phone</example>
    public string Name { get; set; } = string.Empty;
}