using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;

namespace ItemNest.Infrastructure.Repositories;

public class ReportRepository : Repository<Report>, IReportRepository
{
    public ReportRepository(ItemNestDbContext context) : base(context) { }
}
