using ItemNest.Domain.Entities;

namespace ItemNest.Application.Interfaces.Repositories;

public interface IFavoriteRepository : IRepository<Favorite>
{
    Task<Favorite?> FindByUserAndPostAsync(Guid userId, Guid itemPostId);
    IQueryable<Favorite> QueryWithDetails();
}
