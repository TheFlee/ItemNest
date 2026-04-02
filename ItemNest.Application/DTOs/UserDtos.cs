namespace ItemNest.Application.DTOs;

public class CurrentUserDto
{
    /// <summary>
    /// Unique identifier of the user.
    /// </summary>
    /// <example>5b8a2d90-77f4-4c8d-9463-9483fc7b1f88</example>
    public Guid Id { get; set; }

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
    /// Roles of the user.
    /// </summary>
    /// <example>["User"]</example>
    public List<string> Roles { get; set; } = new();

    /// <summary>
    /// Indicates whether the account is blocked.
    /// </summary>
    public bool IsBlocked { get; set; }

    /// <summary>
    /// Account creation date and time.
    /// </summary>
    /// <example>2026-03-10T15:00:00+04:00</example>
    public DateTimeOffset CreatedAt { get; set; }
}

public class UpdateUserEmailDto
{
    public string NewEmail { get; set; } = string.Empty;
    public string CurrentPassword { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsBlocked { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class AdminUpdateUserRoleDto
{
    public string Role { get; set; } = string.Empty;
}

public class AdminUpdateUserBlockStatusDto
{
    public bool IsBlocked { get; set; }
}