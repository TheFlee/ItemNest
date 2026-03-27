namespace ItemNest.Application.DTOs;

/// <summary>
/// Response model returned after successful user registration or login.
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// JWT token used for authenticated requests.
    /// </summary>
    /// <example>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</example>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Unique identifier of the authenticated user.
    /// </summary>
    /// <example>5b8a2d90-77f4-4c8d-9463-9483fc7b1f88</example>
    public Guid UserId { get; set; }

    /// <summary>
    /// Email address of the authenticated user.
    /// </summary>
    /// <example>firidun@example.com</example>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Full name of the authenticated user.
    /// </summary>
    /// <example>Firidun Hesenli</example>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Roles of the authenticated user.
    /// </summary>
    /// <example>["User"]</example>
    public List<string> Roles { get; set; } = new();

    /// <summary>
    /// Expiration date and time of the JWT token.
    /// </summary>
    /// <example>2026-03-14T18:30:00+00:00</example>
    public DateTimeOffset ExpiresAt { get; set; }
}

/// <summary>
/// Request model for user login.
/// </summary>
public class LoginDto
{
    /// <summary>
    /// User email address.
    /// </summary>
    /// <example>firidun@example.com</example>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User password.
    /// </summary>
    /// <example>123456</example>
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Request model for user registration.
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// Full name of the user.
    /// </summary>
    /// <example>Firidun Hesenli</example>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Email address of the user.
    /// </summary>
    /// <example>firidun@example.com</example>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Password for the new account.
    /// </summary>
    /// <example>123456</example>
    public string Password { get; set; } = string.Empty;
}