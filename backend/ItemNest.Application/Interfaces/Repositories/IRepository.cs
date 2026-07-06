using System.Linq.Expressions;

namespace ItemNest.Application.Interfaces.Repositories;

public interface IRepository<T> where T : class
{
    IQueryable<T> Query();
    Task<T?> FindAsync(object id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    Task SaveChangesAsync();
}
