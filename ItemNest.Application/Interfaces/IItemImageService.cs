using ItemNest.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace ItemNest.Application.Interfaces;

public interface IItemImageService
{
    Task<ItemImageDto> UploadAsync(
        Guid itemPostId,
        Stream stream,
        string originalFileName,
        string contentType,
        long length,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ItemImageDto>> GetByPostIdAsync(
        Guid itemPostId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid imageId,
        Guid userId,
        CancellationToken cancellationToken = default);
}
