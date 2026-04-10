using ItemNest.Domain.Entities;

namespace ItemNest.Application.Interfaces.Repositories;

public interface IItemPostRepository : IRepository<ItemPost>
{
    IQueryable<ItemPost> QueryWithDetails();
}
