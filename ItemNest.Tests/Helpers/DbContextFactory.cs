using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Tests.Helpers;

public static class DbContextFactory
{
    public static ItemNestDbContext Create()
    {
        var options = new DbContextOptionsBuilder<ItemNestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ItemNestDbContext(options);
    }
}
