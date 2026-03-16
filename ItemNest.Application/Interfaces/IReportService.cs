using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IReportService
{
    Task<ReportDto> CreateAsync(Guid reporterUserId, CreateReportDto dto);
    Task<IReadOnlyCollection<ReportDto>> GetMyReportsAsync(Guid reporterUserId);
    Task<IReadOnlyCollection<ReportDto>> GetAllAsync();
    Task<ReportDto> ReviewAsync(Guid reportId, Guid adminUserId, ReviewReportDto dto);
}
