using AutoMapper;
using FluentAssertions;
using ItemNest.Application.DTOs;
using ItemNest.Application.Mappings;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Services;
using ItemNest.Tests.Helpers;

namespace ItemNest.Tests.Services;

public class ItemPostServiceTests
{
    private readonly IMapper _mapper;

    public ItemPostServiceTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreatePost()
    {
        var context = DbContextFactory.Create();

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            UserName = "user@test.com",
            FullName = "Test User"
        };

        context.Users.Add(user);

        context.Categories.Add(new Category
        {
            Id = 1,
            Name = "Electronics"
        });

        await context.SaveChangesAsync();

        var service = new ItemPostService(context, _mapper);

        var dto = new CreateItemPostDto
        {
            Title = "Lost iPhone",
            Description = "Black iPhone 13",
            Location = "Baku",
            EventDate = DateTime.UtcNow,
            CategoryId = 1,
            Type = PostType.Lost,
            Color = ItemColor.Black
        };

        var result = await service.CreateAsync(user.Id, dto);

        result.Should().NotBeNull();
        result.Title.Should().Be("Lost iPhone");
        context.ItemPosts.Count().Should().Be(1);
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrow_WhenUserIsNotOwner()
    {
        var context = DbContextFactory.Create();

        context.Categories.Add(new Category
        {
            Id = 1,
            Name = "Electronics"
        });

        var post = new ItemPost
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "Old title",
            Description = "Old description",
            Location = "Baku",
            EventDate = DateTime.UtcNow,
            CategoryId = 1,
            Type = PostType.Lost,
            Status = PostStatus.Open,
            Color = ItemColor.Black,
            CreatedAt = DateTime.UtcNow
        };

        context.ItemPosts.Add(post);
        await context.SaveChangesAsync();

        var service = new ItemPostService(context, _mapper);

        var dto = new UpdateItemPostDto
        {
            Title = "New title",
            Description = "New description",
            Location = "Ganja",
            EventDate = DateTime.UtcNow,
            CategoryId = 1,
            Status = PostStatus.Open,
            Color = ItemColor.Black
        };

        var action = async () => await service.UpdateAsync(post.Id, Guid.NewGuid(), dto);

        await action.Should().ThrowAsync<Exception>();
    }

    [Fact]
    public async Task GetMyPostsAsync_ShouldReturnOnlyCurrentUserPosts()
    {
        var context = DbContextFactory.Create();

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            UserName = "user@test.com",
            FullName = "Test User"
        };

        context.Users.Add(user);

        context.Categories.Add(new Category
        {
            Id = 1,
            Name = "Electronics"
        });

        context.ItemPosts.AddRange(
            new ItemPost
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Title = "Post 1",
                Description = "Desc 1",
                Location = "Baku",
                EventDate = DateTime.UtcNow,
                CategoryId = 1,
                Type = PostType.Lost,
                Status = PostStatus.Open,
                Color = ItemColor.Black,
                CreatedAt = DateTime.UtcNow
            },
            new ItemPost
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                Title = "Post 2",
                Description = "Desc 2",
                Location = "Ganja",
                EventDate = DateTime.UtcNow,
                CategoryId = 1,
                Type = PostType.Found,
                Status = PostStatus.Open,
                Color = ItemColor.White,
                CreatedAt = DateTime.UtcNow
            });

        await context.SaveChangesAsync();

        var service = new ItemPostService(context, _mapper);

        var result = await service.GetMyPostsAsync(user.Id);

        result.Should().HaveCount(1);
        result.First().Title.Should().Be("Post 1");
    }
}
