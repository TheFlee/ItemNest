namespace ItemNest.Domain.Entities;

using global::ItemNest.Domain.Enums;

public class Report
{
    public Guid Id { get; set; }

    public Guid ReporterUserId { get; set; }
    public AppUser ReporterUser { get; set; } = null!;

    public Guid ItemPostId { get; set; }
    public ItemPost ItemPost { get; set; } = null!;

    public ReportReason Reason { get; set; }
    public string Description { get; set; } = string.Empty;
    public ReportStatus Status { get; set; } = ReportStatus.Pending;

    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }
    public AppUser? ReviewedByUser { get; set; }
}
