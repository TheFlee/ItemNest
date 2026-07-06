using FluentValidation;
using ItemNest.Application.DTOs;

namespace ItemNest.Application.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(100).WithMessage("Full name cannot exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
    }
}

public class LoginDtoValidator : AbstractValidator<LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class GoogleLoginDtoValidator : AbstractValidator<GoogleLoginDto>
{
    public GoogleLoginDtoValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("Google ID token is required.");
    }
}

public class UpdateUserEmailDtoValidator : AbstractValidator<UpdateUserEmailDto>
{
    public UpdateUserEmailDtoValidator()
    {
        RuleFor(x => x.NewEmail)
            .NotEmpty().WithMessage("New email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");
    }
}

public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordDtoValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long.");
    }
}