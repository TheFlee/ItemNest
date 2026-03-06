namespace ItemNest.Application.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public DateTimeOffset ExpiresAt { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}