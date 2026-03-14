using FluentValidation;
using ItemNest.Application.DTOs;

namespace ItemNest.Application.Validators;

public class CreateItemPostDtoValidator : AbstractValidator<CreateItemPostDto>
{
    public CreateItemPostDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(150).WithMessage("Location cannot exceed 150 characters.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");

        RuleFor(x => x.EventDate)
            .NotEmpty().WithMessage("EventDate is required.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid post type.");

        RuleFor(x => x.Color)
            .IsInEnum().WithMessage("Invalid item color.");
    }
}

public class UpdateItemPostDtoValidator : AbstractValidator<UpdateItemPostDto>
{
    public UpdateItemPostDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(150).WithMessage("Location cannot exceed 150 characters.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("CategoryId must be greater than 0.");

        RuleFor(x => x.EventDate)
            .NotEmpty().WithMessage("EventDate is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid post status.");

        RuleFor(x => x.Color)
            .IsInEnum().WithMessage("Invalid item color.");
    }
}

public class ItemPostFilterDtoValidator : AbstractValidator<ItemPostFilterDto>
{
    private static readonly string[] AllowedSortBy = ["createdAt", "title", "eventDate"];
    private static readonly string[] AllowedSortDirection = ["asc", "desc"];

    public ItemPostFilterDtoValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0).WithMessage("PageNumber must be greater than 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 50).WithMessage("PageSize must be between 1 and 50.");

        RuleFor(x => x.SortBy)
            .Must(x => string.IsNullOrWhiteSpace(x) || AllowedSortBy.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("SortBy must be one of: createdAt, title, eventDate.");

        RuleFor(x => x.SortDirection)
            .Must(x => string.IsNullOrWhiteSpace(x) || AllowedSortDirection.Contains(x, StringComparer.OrdinalIgnoreCase))
            .WithMessage("SortDirection must be either asc or desc.");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0)
            .When(x => x.CategoryId.HasValue)
            .WithMessage("CategoryId must be greater than 0.");
    }
}
