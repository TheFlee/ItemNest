using ItemNest.Domain.Entities;

namespace ItemNest.Application.Interfaces.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<bool> IsNameTakenAsync(string name, int? excludeId = null);
    Task<bool> IsUsedByPostsAsync(int categoryId);
}
