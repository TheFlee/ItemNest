using ItemNest.Domain.Enums;

namespace ItemNest.Application.DTOs;

/// <summary>
/// Request model for creating a report.
/// </summary>
public class CreateReportDto
{
    /// <summary>
    /// Reported item post ID.
    /// </summary>
    public Guid ItemPostId { get; set; }

    /// <summary>
    /// Report reason.
    /// </summary>
    public ReportReason Reason { get; set; }

    /// <summary>
    /// Additional description.
    /// </summary>
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Request model for reviewing a report.
/// </summary>
public class ReviewReportDto
{
    /// <summary>
    /// New report status.
    /// </summary>
    public ReportStatus Status { get; set; }
}

/// <summary>
/// Response model for reports.
/// </summary>
public class ReportDto
{
    public Guid Id { get; set; }

    public Guid ReporterUserId { get; set; }
    public string ReporterFullName { get; set; } = string.Empty;

    public Guid ItemPostId { get; set; }
    public string ItemPostTitle { get; set; } = string.Empty;

    public ReportReason Reason { get; set; }
    public string Description { get; set; } = string.Empty;
    public ReportStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }
}