using ItemNest.Application.DTOs;

namespace ItemNest.Application.Interfaces;

public interface IContactRequestService
{
    Task<ContactRequestDto> CreateAsync(Guid requesterUserId, CreateContactRequestDto dto);
    Task<IReadOnlyCollection<ContactRequestDto>> GetSentAsync(Guid requesterUserId);
    Task<IReadOnlyCollection<ContactRequestDto>> GetReceivedAsync(Guid postOwnerUserId);
    Task<ContactRequestDto> AcceptAsync(Guid requestId, Guid postOwnerUserId);
    Task<ContactRequestDto> RejectAsync(Guid requestId, Guid postOwnerUserId);
    Task<ContactRequestDto> CancelAsync(Guid requestId, Guid requesterUserId);
}
