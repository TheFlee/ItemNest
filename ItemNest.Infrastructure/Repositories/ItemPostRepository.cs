using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Repositories;

public class ItemPostRepository : Repository<ItemPost>, IItemPostRepository
{
    public ItemPostRepository(ItemNestDbContext context) : base(context) { }

    public IQueryable<ItemPost> QueryWithDetails() =>
        Query()
            .Include(x => x.Category)
            .Include(x => x.User)
            .Include(x => x.Images);
}
