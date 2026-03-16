using AutoMapper;
using FluentAssertions;
using ItemNest.Application.DTOs;
using ItemNest.Application.Mappings;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Services;
using ItemNest.Tests.Helpers;

namespace ItemNest.Tests.Services;

public class ReportServiceTests
{
    private readonly IMapper _mapper;

    public ReportServiceTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateReport()
    {
        var context = DbContextFactory.Create();

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            UserName = "user@test.com",
            FullName = "Test User"
        };

        var post = new ItemPost
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "Lost phone",
            Description = "Lost iPhone",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        context.ItemPosts.Add(post);

        await context.SaveChangesAsync();

        var service = new ReportService(context, _mapper);

        var dto = new CreateReportDto
        {
            ItemPostId = post.Id,
            Reason = ReportReason.Spam,
            Description = "Looks like spam"
        };

        var result = await service.CreateAsync(user.Id, dto);

        result.Should().NotBeNull();
        result.Reason.Should().Be(ReportReason.Spam);

        context.Reports.Count().Should().Be(1);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenUserReportsOwnPost()
    {
        var context = DbContextFactory.Create();

        var userId = Guid.NewGuid();

        var post = new ItemPost
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = "Lost phone",
            Description = "Lost iPhone",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        };

        context.ItemPosts.Add(post);
        await context.SaveChangesAsync();

        var service = new ReportService(context, _mapper);

        var dto = new CreateReportDto
        {
            ItemPostId = post.Id,
            Reason = ReportReason.Spam
        };

        var action = async () => await service.CreateAsync(userId, dto);

        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenSameUserReportsSamePostTwice()
    {
        var context = DbContextFactory.Create();

        var userId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        context.Users.Add(new AppUser
        {
            Id = userId,
            Email = "user@test.com",
            UserName = "user@test.com",
            FullName = "Test User"
        });

        context.ItemPosts.Add(new ItemPost
        {
            Id = postId,
            UserId = Guid.NewGuid(),
            Title = "Lost Phone",
            Description = "Lost phone desc",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        });

        context.Reports.Add(new Report
        {
            Id = Guid.NewGuid(),
            ReporterUserId = userId,
            ItemPostId = postId,
            Reason = ReportReason.Spam,
            Description = "Spam",
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var service = new ReportService(context, _mapper);

        var dto = new CreateReportDto
        {
            ItemPostId = postId,
            Reason = ReportReason.FakePost,
            Description = "Fake"
        };

        var action = async () => await service.CreateAsync(userId, dto);

        await action.Should().ThrowAsync<InvalidOperationException>();
    }
}
