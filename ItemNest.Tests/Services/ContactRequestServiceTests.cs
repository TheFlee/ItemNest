using AutoMapper;
using FluentAssertions;
using ItemNest.Application.DTOs;
using ItemNest.Application.Mappings;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Repositories;
using ItemNest.Infrastructure.Services;
using ItemNest.Tests.Helpers;

namespace ItemNest.Tests.Services;

public class ContactRequestServiceTests
{
    private readonly IMapper _mapper;

    public ContactRequestServiceTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateContactRequest()
    {
        // arrange
        var context = DbContextFactory.Create();

        var requester = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "requester@test.com",
            UserName = "requester@test.com",
            FullName = "Requester User"
        };

        var owner = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "owner@test.com",
            UserName = "owner@test.com",
            FullName = "Post Owner"
        };

        var post = new ItemPost
        {
            Id = Guid.NewGuid(),
            UserId = owner.Id,
            Title = "Lost wallet",
            Description = "Black wallet lost near the park",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(requester, owner);
        context.ItemPosts.Add(post);
        await context.SaveChangesAsync();

        var contactRequestRepo = new ContactRequestRepository(context);
        var itemPostRepo = new ItemPostRepository(context);
        var service = new ContactRequestService(contactRequestRepo, itemPostRepo, _mapper);

        var dto = new CreateContactRequestDto
        {
            ItemPostId = post.Id,
            Message = "Hi, I think I found your wallet."
        };

        // act
        var result = await service.CreateAsync(requester.Id, dto);

        // assert
        result.Should().NotBeNull();
        result.Status.Should().Be(ContactRequestStatus.Pending);
        result.ItemPostId.Should().Be(post.Id);

        context.ContactRequests.Count().Should().Be(1);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenUserContactsOwnPost()
    {
        // arrange
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

        var contactRequestRepo = new ContactRequestRepository(context);
        var itemPostRepo = new ItemPostRepository(context);
        var service = new ContactRequestService(contactRequestRepo, itemPostRepo, _mapper);

        var dto = new CreateContactRequestDto
        {
            ItemPostId = post.Id,
            Message = "This is my own post."
        };

        // act
        var action = async () => await service.CreateAsync(userId, dto);

        // assert
        await action.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task AcceptAsync_ShouldAcceptPendingRequest()
    {
        // arrange
        var context = DbContextFactory.Create();

        var requester = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "requester@test.com",
            UserName = "requester@test.com",
            FullName = "Requester User"
        };

        var owner = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = "owner@test.com",
            UserName = "owner@test.com",
            FullName = "Post Owner"
        };

        var post = new ItemPost
        {
            Id = Guid.NewGuid(),
            UserId = owner.Id,
            Title = "Lost wallet",
            Description = "Black wallet",
            Location = "Baku",
            CreatedAt = DateTime.UtcNow
        };

        var contactRequest = new ContactRequest
        {
            Id = Guid.NewGuid(),
            RequesterUserId = requester.Id,
            PostOwnerUserId = owner.Id,
            ItemPostId = post.Id,
            Message = "I found it.",
            Status = ContactRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.AddRange(requester, owner);
        context.ItemPosts.Add(post);
        context.ContactRequests.Add(contactRequest);
        await context.SaveChangesAsync();

        var contactRequestRepo = new ContactRequestRepository(context);
        var itemPostRepo = new ItemPostRepository(context);
        var service = new ContactRequestService(contactRequestRepo, itemPostRepo, _mapper);

        // act
        var result = await service.AcceptAsync(contactRequest.Id, owner.Id);

        // assert
        result.Should().NotBeNull();
        result.Status.Should().Be(ContactRequestStatus.Accepted);
        result.RespondedAt.Should().NotBeNull();
    }
}
