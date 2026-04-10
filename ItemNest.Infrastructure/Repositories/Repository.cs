using System.Linq.Expressions;
using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ItemNestDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(ItemNestDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public IQueryable<T> Query() => DbSet.AsQueryable();

    public async Task<T?> FindAsync(object id) => await DbSet.FindAsync(id);

    public async Task AddAsync(T entity) => await DbSet.AddAsync(entity);

    public void Update(T entity) => DbSet.Update(entity);

    public void Delete(T entity) => DbSet.Remove(entity);

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate) =>
        await DbSet.AnyAsync(predicate);

    public async Task SaveChangesAsync() => await Context.SaveChangesAsync();
}
