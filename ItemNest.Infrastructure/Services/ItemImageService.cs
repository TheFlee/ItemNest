using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Application.Exceptions;
using ItemNest.Application.Interfaces;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Services;

public class ItemImageService : IItemImageService
{
    private readonly ItemNestDbContext _context;
    private readonly IWebHostEnvironment _environment;
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
        IWebHostEnvironment environment,
        IMapper mapper)
    {
        _context = context;
        _environment = environment;
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

        var webRootPath = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadFolder = Path.Combine(webRootPath, "uploads", "itemposts");
        Directory.CreateDirectory(uploadFolder);

        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(uploadFolder, storedFileName);

        await using (var fileStream = new FileStream(fullPath, FileMode.Create))
        {
            await stream.CopyToAsync(fileStream, cancellationToken);
        }

        var image = new ItemImage
        {
            Id = Guid.NewGuid(),
            ItemPostId = itemPostId,
            ImageUrl = $"/uploads/itemposts/{storedFileName}",
            StoredFileName = storedFileName,
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

        var webRootPath = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var fullPath = Path.Combine(webRootPath, "uploads", "itemposts", image.StoredFileName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        _context.ItemImages.Remove(image);
        await _context.SaveChangesAsync(cancellationToken);
    }
}