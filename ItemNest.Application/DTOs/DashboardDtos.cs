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
    /// Number of the user's posts that are marked as returned.
    /// </summary>
    /// <example>2</example>
    public int ReturnedPostsCount { get; set; }

    /// <summary>
    /// Number of the user's posts that are closed.
    /// </summary>
    /// <example>1</example>
    public int ClosedPostsCount { get; set; }

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

    /// <summary>
    /// Total number of reports created by the user.
    /// </summary>
    /// <example>4</example>
    public int MyReportsCount { get; set; }
}

/// <summary>
/// Response model representing dashboard summary data for administrators.
/// </summary>
public class AdminDashboardDto
{
    /// <summary>
    /// Total number of users in the system.
    /// </summary>
    /// <example>125</example>
    public int TotalUsersCount { get; set; }

    /// <summary>
    /// Total number of posts in the system.
    /// </summary>
    /// <example>340</example>
    public int TotalPostsCount { get; set; }

    /// <summary>
    /// Number of open posts in the system.
    /// </summary>
    /// <example>220</example>
    public int OpenPostsCount { get; set; }

    /// <summary>
    /// Number of returned posts in the system.
    /// </summary>
    /// <example>70</example>
    public int ReturnedPostsCount { get; set; }

    /// <summary>
    /// Number of closed posts in the system.
    /// </summary>
    /// <example>50</example>
    public int ClosedPostsCount { get; set; }

    /// <summary>
    /// Total number of categories in the system.
    /// </summary>
    /// <example>12</example>
    public int TotalCategoriesCount { get; set; }

    /// <summary>
    /// Number of pending reports in the system.
    /// </summary>
    /// <example>8</example>
    public int PendingReportsCount { get; set; }

    /// <summary>
    /// Number of pending contact requests in the system.
    /// </summary>
    /// <example>16</example>
    public int PendingContactRequestsCount { get; set; }
}