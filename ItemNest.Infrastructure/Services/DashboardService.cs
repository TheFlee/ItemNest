using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ItemNestDbContext _context;

    public DashboardService(ItemNestDbContext context)
    {
        _context = context;
    }

    public async Task<MyDashboardDto> GetMyDashboardAsync(Guid userId)
    {
        var userExists = await _context.Users.AnyAsync(x => x.Id == userId);
        if (!userExists)
            throw new KeyNotFoundException("User not found.");

        var myPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId);

        var openPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId && x.Status == PostStatus.Open);

        var returnedPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId && x.Status == PostStatus.Returned);

        var closedPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId && x.Status == PostStatus.Closed);

        var favoritesCount = await _context.Favorites
            .AsNoTracking()
            .CountAsync(x => x.UserId == userId);

        var pendingReceivedContactRequestsCount = await _context.ContactRequests
            .AsNoTracking()
            .CountAsync(x =>
                x.PostOwnerUserId == userId &&
                x.Status == ContactRequestStatus.Pending);

        var pendingSentContactRequestsCount = await _context.ContactRequests
            .AsNoTracking()
            .CountAsync(x =>
                x.RequesterUserId == userId &&
                x.Status == ContactRequestStatus.Pending);

        var myReportsCount = await _context.Reports
            .AsNoTracking()
            .CountAsync(x => x.ReporterUserId == userId);

        return new MyDashboardDto
        {
            MyPostsCount = myPostsCount,
            OpenPostsCount = openPostsCount,
            ReturnedPostsCount = returnedPostsCount,
            ClosedPostsCount = closedPostsCount,
            FavoritesCount = favoritesCount,
            PendingReceivedContactRequestsCount = pendingReceivedContactRequestsCount,
            PendingSentContactRequestsCount = pendingSentContactRequestsCount,
            MyReportsCount = myReportsCount
        };
    }

    public async Task<AdminDashboardDto> GetAdminDashboardAsync()
    {
        var totalUsersCount = await _context.Users
            .AsNoTracking()
            .CountAsync();

        var totalPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync();

        var openPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.Status == PostStatus.Open);

        var returnedPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.Status == PostStatus.Returned);

        var closedPostsCount = await _context.ItemPosts
            .AsNoTracking()
            .CountAsync(x => x.Status == PostStatus.Closed);

        var totalCategoriesCount = await _context.Categories
            .AsNoTracking()
            .CountAsync();

        var pendingReportsCount = await _context.Reports
            .AsNoTracking()
            .CountAsync(x => x.Status == ReportStatus.Pending);

        var pendingContactRequestsCount = await _context.ContactRequests
            .AsNoTracking()
            .CountAsync(x => x.Status == ContactRequestStatus.Pending);

        return new AdminDashboardDto
        {
            TotalUsersCount = totalUsersCount,
            TotalPostsCount = totalPostsCount,
            OpenPostsCount = openPostsCount,
            ReturnedPostsCount = returnedPostsCount,
            ClosedPostsCount = closedPostsCount,
            TotalCategoriesCount = totalCategoriesCount,
            PendingReportsCount = pendingReportsCount,
            PendingContactRequestsCount = pendingContactRequestsCount
        };
    }
}