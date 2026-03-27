using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IDashboardService
{
    Task<MyDashboardDto> GetMyDashboardAsync(Guid userId);
}