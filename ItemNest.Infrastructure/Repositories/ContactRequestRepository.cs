using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;

namespace ItemNest.Infrastructure.Repositories;

public class ContactRequestRepository : Repository<ContactRequest>, IContactRequestRepository
{
    public ContactRequestRepository(ItemNestDbContext context) : base(context) { }
}
