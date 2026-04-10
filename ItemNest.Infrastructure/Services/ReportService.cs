using AutoMapper;
using AutoMapper.QueryableExtensions;
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepository;
    private readonly IItemPostRepository _itemPostRepository;
    private readonly IMapper _mapper;

    public ReportService(
        IReportRepository reportRepository,
        IItemPostRepository itemPostRepository,
        IMapper mapper)
    {
        _reportRepository = reportRepository;
        _itemPostRepository = itemPostRepository;
        _mapper = mapper;
    }

    public async Task<ReportDto> CreateAsync(Guid reporterUserId, CreateReportDto dto)
    {
        var itemPost = await _itemPostRepository.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dto.ItemPostId);

        if (itemPost is null)
            throw new KeyNotFoundException("Item post not found.");

        if (itemPost.UserId == reporterUserId)
            throw new InvalidOperationException("You cannot report your own post.");

        var alreadyReported = await _reportRepository.AnyAsync(
            x => x.ReporterUserId == reporterUserId && x.ItemPostId == dto.ItemPostId);

        if (alreadyReported)
            throw new InvalidOperationException("You have already reported this post.");

        var report = new Report
        {
            Id = Guid.NewGuid(),
            ReporterUserId = reporterUserId,
            ItemPostId = dto.ItemPostId,
            Reason = dto.Reason,
            Description = dto.Description.Trim(),
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _reportRepository.AddAsync(report);
        await _reportRepository.SaveChangesAsync();

        return await ProjectReports()
            .FirstAsync(x => x.Id == report.Id);
    }

    public async Task<IReadOnlyCollection<ReportDto>> GetMyReportsAsync(Guid reporterUserId)
    {
        return await ProjectReports()
            .Where(x => x.ReporterUserId == reporterUserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<IReadOnlyCollection<ReportDto>> GetAllAsync()
    {
        return await ProjectReports()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<ReportDto> ReviewAsync(Guid reportId, Guid adminUserId, ReviewReportDto dto)
    {
        var report = await _reportRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == reportId);

        if (report is null)
            throw new KeyNotFoundException("Report not found.");

        if (report.Status != ReportStatus.Pending)
            throw new InvalidOperationException("This report has already been reviewed.");

        report.Status = dto.Status;
        report.ReviewedAt = DateTime.UtcNow;
        report.ReviewedByUserId = adminUserId;

        await _reportRepository.SaveChangesAsync();

        return await ProjectReports()
            .FirstAsync(x => x.Id == report.Id);
    }

    private IQueryable<ReportDto> ProjectReports() =>
        _reportRepository.Query()
            .AsNoTracking()
            .ProjectTo<ReportDto>(_mapper.ConfigurationProvider);
}
