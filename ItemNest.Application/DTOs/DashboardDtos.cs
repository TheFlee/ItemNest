namespace ItemNest.Application.DTOs;

/// <summary>
/// Response model representing dashboard summary data for the current user.
/// </summary>
public class MyDashboardDto
{
    /// <summary>
    /// Total number of posts created by the user.
    /// </summary>
    /// <example>8</example>
    public int MyPostsCount { get; set; }

    /// <summary>
    /// Number of the user's posts that are currently open.
    /// </summary>
    /// <example>5</example>
    public int OpenPostsCount { get; set; }

    /// <summary>
    /// Total number of posts in the user's favorites.
    /// </summary>
    /// <example>12</example>
    public int FavoritesCount { get; set; }

    /// <summary>
    /// Number of pending contact requests received by the user as a post owner.
    /// </summary>
    /// <example>3</example>
    public int PendingReceivedContactRequestsCount { get; set; }

    /// <summary>
    /// Number of pending contact requests sent by the user.
    /// </summary>
    /// <example>2</example>
    public int PendingSentContactRequestsCount { get; set; }
}