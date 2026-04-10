using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using AutoMapper;
using ItemNest.Application.Configurations;
using ItemNest.Application.DTOs;
using ItemNest.Application.Exceptions;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ItemNest.Infrastructure.Services;

public class ItemImageService : IItemImageService
{
    private readonly ItemNestDbContext _context;
    private readonly IAmazonS3 _s3Client;
    private readonly AwsSettings _awsSettings;
    private readonly IMapper _mapper;

    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private static readonly string[] AllowedExtensions =
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    private const long MaxFileSize = 5 * 1024 * 1024;
    private const int MaxImageCountPerPost = 5;

    public ItemImageService(
        ItemNestDbContext context,
        IAmazonS3 s3Client,
        IOptions<AwsSettings> awsSettings,
        IMapper mapper)
    {
        _context = context;
        _s3Client = s3Client;
        _awsSettings = awsSettings.Value;
        _mapper = mapper;
    }

    public async Task<ItemImageDto> UploadAsync(
        Guid itemPostId,
        Stream stream,
        string originalFileName,
        string contentType,
        long length,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        if (stream is null)
            throw new ArgumentException("File stream cannot be null.");

        if (string.IsNullOrWhiteSpace(originalFileName))
            throw new ArgumentException("File name cannot be empty.");

        if (string.IsNullOrWhiteSpace(contentType))
            throw new ArgumentException("Content type cannot be empty.");

        if (length <= 0)
            throw new ArgumentException("File cannot be empty.");

        if (length > MaxFileSize)
            throw new ArgumentException("Image size cannot exceed 5 MB.");

        if (!AllowedContentTypes.Contains(contentType.ToLower()))
            throw new ArgumentException("Only JPEG, PNG, and WebP images are allowed.");

        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
            throw new ArgumentException("Invalid file extension.");

        var post = await _context.ItemPosts
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == itemPostId, cancellationToken);

        if (post is null)
            throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new ForbiddenException("You are not allowed to upload images to this post.");

        if (post.Images.Count >= MaxImageCountPerPost)
            throw new InvalidOperationException("A post can have a maximum of 5 images.");

        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var s3Key = $"uploads/itemposts/{storedFileName}";

        var uploadRequest = new TransferUtilityUploadRequest
        {
            BucketName = _awsSettings.BucketName,
            Key = s3Key,
            InputStream = stream,
            ContentType = contentType,
            AutoCloseStream = false,
        };

        var transferUtility = new TransferUtility(_s3Client);
        await transferUtility.UploadAsync(uploadRequest, cancellationToken);

        var imageUrl = $"https://{_awsSettings.BucketName}.s3.{_awsSettings.Region}.amazonaws.com/{s3Key}";

        var image = new ItemImage
        {
            Id = Guid.NewGuid(),
            ItemPostId = itemPostId,
            ImageUrl = imageUrl,
            StoredFileName = s3Key,
            ContentType = contentType,
            FileSize = length,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _context.ItemImages.Add(image);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ItemImageDto>(image);
    }

    public async Task<IReadOnlyList<ItemImageDto>> GetByPostIdAsync(
        Guid itemPostId,
        CancellationToken cancellationToken = default)
    {
        var postExists = await _context.ItemPosts
            .AnyAsync(x => x.Id == itemPostId, cancellationToken);

        if (!postExists)
            throw new KeyNotFoundException("Post not found.");

        var images = await _context.ItemImages
            .AsNoTracking()
            .Where(x => x.ItemPostId == itemPostId)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return _mapper.Map<IReadOnlyList<ItemImageDto>>(images);
    }

    public async Task DeleteAsync(
        Guid imageId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var image = await _context.ItemImages
            .Include(x => x.ItemPost)
            .FirstOrDefaultAsync(x => x.Id == imageId, cancellationToken);

        if (image is null)
            throw new KeyNotFoundException("Image not found.");

        if (image.ItemPost.UserId != userId)
            throw new ForbiddenException("You are not allowed to delete this image.");

        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _awsSettings.BucketName,
            Key = image.StoredFileName
        };

        await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);

        _context.ItemImages.Remove(image);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
