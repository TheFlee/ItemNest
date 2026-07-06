using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Repositories;

public class FavoriteRepository : Repository<Favorite>, IFavoriteRepository
{
    public FavoriteRepository(ItemNestDbContext context) : base(context) { }

    public async Task<Favorite?> FindByUserAndPostAsync(Guid userId, Guid itemPostId) =>
        await Query().FirstOrDefaultAsync(x => x.UserId == userId && x.ItemPostId == itemPostId);

    public IQueryable<Favorite> QueryWithDetails() =>
        Query()
            .Include(x => x.ItemPost)
                .ThenInclude(p => p.Category)
            .Include(x => x.ItemPost)
                .ThenInclude(p => p.Images);
}
