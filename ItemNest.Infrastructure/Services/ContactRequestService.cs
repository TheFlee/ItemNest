using AutoMapper;
using AutoMapper.QueryableExtensions;
using ItemNest.Application.DTOs;
using ItemNest.Application.Interfaces;
using ItemNest.Application.Interfaces.Repositories;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class ContactRequestService : IContactRequestService
{
    private readonly IContactRequestRepository _contactRequestRepository;
    private readonly IItemPostRepository _itemPostRepository;
    private readonly IMapper _mapper;

    public ContactRequestService(
        IContactRequestRepository contactRequestRepository,
        IItemPostRepository itemPostRepository,
        IMapper mapper)
    {
        _contactRequestRepository = contactRequestRepository;
        _itemPostRepository = itemPostRepository;
        _mapper = mapper;
    }

    public async Task<ContactRequestDto> CreateAsync(Guid requesterUserId, CreateContactRequestDto dto)
    {
        var post = await _itemPostRepository.Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dto.ItemPostId);

        if (post is null)
            throw new KeyNotFoundException("Item post not found.");

        if (post.UserId == requesterUserId)
            throw new InvalidOperationException("You cannot send a contact request for your own post.");

        var pendingExists = await _contactRequestRepository.AnyAsync(x =>
            x.RequesterUserId == requesterUserId &&
            x.ItemPostId == dto.ItemPostId &&
            x.Status == ContactRequestStatus.Pending);

        if (pendingExists)
            throw new InvalidOperationException("You already have a pending contact request for this post.");

        var contactRequest = new ContactRequest
        {
            Id = Guid.NewGuid(),
            RequesterUserId = requesterUserId,
            PostOwnerUserId = post.UserId,
            ItemPostId = dto.ItemPostId,
            Message = dto.Message.Trim(),
            Status = ContactRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _contactRequestRepository.AddAsync(contactRequest);
        await _contactRequestRepository.SaveChangesAsync();

        return await GetProjectedQuery()
            .FirstAsync(x => x.Id == contactRequest.Id);
    }

    public async Task<IReadOnlyCollection<ContactRequestDto>> GetSentAsync(Guid requesterUserId)
    {
        var items = await _contactRequestRepository.Query()
            .AsNoTracking()
            .Where(x => x.RequesterUserId == requesterUserId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ContactRequestDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return items.Select(HideSensitiveDataIfNeeded).ToList();
    }

    public async Task<IReadOnlyCollection<ContactRequestDto>> GetReceivedAsync(Guid postOwnerUserId)
    {
        var items = await _contactRequestRepository.Query()
            .AsNoTracking()
            .Where(x => x.PostOwnerUserId == postOwnerUserId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<ContactRequestDto>(_mapper.ConfigurationProvider)
            .ToListAsync();

        return items.Select(HideSensitiveDataIfNeeded).ToList();
    }

    public async Task<ContactRequestDto> AcceptAsync(Guid requestId, Guid postOwnerUserId)
    {
        var request = await _contactRequestRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == requestId);

        if (request is null)
            throw new KeyNotFoundException("Contact request not found.");

        if (request.PostOwnerUserId != postOwnerUserId)
            throw new UnauthorizedAccessException("You are not allowed to accept this contact request.");

        if (request.Status != ContactRequestStatus.Pending)
            throw new InvalidOperationException("Only pending contact requests can be accepted.");

        request.Status = ContactRequestStatus.Accepted;
        request.RespondedAt = DateTime.UtcNow;

        await _contactRequestRepository.SaveChangesAsync();

        return await GetProjectedQuery()
            .FirstAsync(x => x.Id == request.Id);
    }

    public async Task<ContactRequestDto> RejectAsync(Guid requestId, Guid postOwnerUserId)
    {
        var request = await _contactRequestRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == requestId);

        if (request is null)
            throw new KeyNotFoundException("Contact request not found.");

        if (request.PostOwnerUserId != postOwnerUserId)
            throw new UnauthorizedAccessException("You are not allowed to reject this contact request.");

        if (request.Status != ContactRequestStatus.Pending)
            throw new InvalidOperationException("Only pending contact requests can be rejected.");

        request.Status = ContactRequestStatus.Rejected;
        request.RespondedAt = DateTime.UtcNow;

        await _contactRequestRepository.SaveChangesAsync();

        return HideSensitiveDataIfNeeded(await GetProjectedQuery()
            .FirstAsync(x => x.Id == request.Id));
    }

    public async Task<ContactRequestDto> CancelAsync(Guid requestId, Guid requesterUserId)
    {
        var request = await _contactRequestRepository.Query()
            .FirstOrDefaultAsync(x => x.Id == requestId);

        if (request is null)
            throw new KeyNotFoundException("Contact request not found.");

        if (request.RequesterUserId != requesterUserId)
            throw new UnauthorizedAccessException("You are not allowed to cancel this contact request.");

        if (request.Status != ContactRequestStatus.Pending)
            throw new InvalidOperationException("Only pending contact requests can be cancelled.");

        request.Status = ContactRequestStatus.Cancelled;
        request.RespondedAt = DateTime.UtcNow;

        await _contactRequestRepository.SaveChangesAsync();

        return HideSensitiveDataIfNeeded(await GetProjectedQuery()
            .FirstAsync(x => x.Id == request.Id));
    }

    private IQueryable<ContactRequestDto> GetProjectedQuery() =>
        _contactRequestRepository.Query()
            .AsNoTracking()
            .ProjectTo<ContactRequestDto>(_mapper.ConfigurationProvider);

    private static ContactRequestDto HideSensitiveDataIfNeeded(ContactRequestDto dto)
    {
        if (dto.Status != ContactRequestStatus.Accepted)
        {
            dto.RequesterEmail = null;
            dto.PostOwnerEmail = null;
        }

        return dto;
    }
}
