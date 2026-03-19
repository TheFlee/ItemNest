using FluentValidation;
using ItemNest.Application.DTOs;

namespace ItemNest.Application.Validators;

public class CreateContactRequestDtoValidator : AbstractValidator<CreateContactRequestDto>
{
    public CreateContactRequestDtoValidator()
    {
        RuleFor(x => x.ItemPostId)
            .NotEmpty().WithMessage("ItemPostId is required.");

        RuleFor(x => x.Message)
            .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters.");
    }
}
