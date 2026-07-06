using FluentValidation;
using ItemNest.Application.DTOs;
using ItemNest.Domain.Enums;

namespace ItemNest.Application.Validators;

public class CreateReportDtoValidator : AbstractValidator<CreateReportDto>
{
    public CreateReportDtoValidator()
    {
        RuleFor(x => x.ItemPostId)
            .NotEmpty().WithMessage("ItemPostId is required.");

        RuleFor(x => x.Reason)
            .IsInEnum().WithMessage("Invalid report reason.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required when reason is Other.")
            .When(x => x.Reason == ReportReason.Other);
    }
}

public class ReviewReportDtoValidator : AbstractValidator<ReviewReportDto>
{
    public ReviewReportDtoValidator()
    {
        RuleFor(x => x.Status)
            .Must(x => x == ReportStatus.Reviewed || x == ReportStatus.Rejected)
            .WithMessage("Status must be either Reviewed or Rejected.");
    }
}