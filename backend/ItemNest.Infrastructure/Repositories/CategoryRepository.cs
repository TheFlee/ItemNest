using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(ItemNestDbContext context) : base(context) { }

    public async Task<bool> IsNameTakenAsync(string name, int? excludeId = null)
    {
        var normalized = name.Trim().ToLower();

        return excludeId.HasValue
            ? await AnyAsync(x => x.Id != excludeId.Value && x.Name.ToLower() == normalized)
            : await AnyAsync(x => x.Name.ToLower() == normalized);
    }

    public async Task<bool> IsUsedByPostsAsync(int categoryId) =>
        await Context.ItemPosts.AnyAsync(x => x.CategoryId == categoryId);
}
