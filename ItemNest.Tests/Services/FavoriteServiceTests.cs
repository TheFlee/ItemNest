using AutoMapper;
using FluentAssertions;
using ItemNest.Application.Mappings;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Services;
using ItemNest.Tests.Helpers;

namespace ItemNest.Tests.Services;

public class FavoriteServiceTests
{
    private readonly IMapper _mapper;

    public FavoriteServiceTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task AddAsync_ShouldAddFavorite()
    {
        var context = DbContextFactory.Create();

        var userId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        context.ItemPosts.Add(new ItemPost
        {
            Id = postId,
            UserId = Guid.NewGuid(),
            Title = "Lost Wallet",
            Description = "Black wallet",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var service = new FavoriteService(context, _mapper);

        await service.AddAsync(userId, postId);

        context.Favorites.Count().Should().Be(1);
        context.Favorites.First().UserId.Should().Be(userId);
        context.Favorites.First().ItemPostId.Should().Be(postId);
    }

    [Fact]
    public async Task AddAsync_ShouldThrow_WhenFavoriteAlreadyExists()
    {
        var context = DbContextFactory.Create();

        var userId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        context.ItemPosts.Add(new ItemPost
        {
            Id = postId,
            UserId = Guid.NewGuid(),
            Title = "Phone",
            Description = "Lost phone",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        });

        context.Favorites.Add(new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ItemPostId = postId,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var service = new FavoriteService(context, _mapper);

        var action = async () => await service.AddAsync(userId, postId);

        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task RemoveAsync_ShouldRemoveFavorite()
    {
        var context = DbContextFactory.Create();

        var userId = Guid.NewGuid();
        var postId = Guid.NewGuid();

        context.Favorites.Add(new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ItemPostId = postId,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        var service = new FavoriteService(context, _mapper);

        await service.RemoveAsync(userId, postId);

        context.Favorites.Should().BeEmpty();
    }
}
