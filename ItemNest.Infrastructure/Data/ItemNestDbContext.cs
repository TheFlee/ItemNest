using ItemNest.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Data;

public class ItemNestDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public ItemNestDbContext(DbContextOptions<ItemNestDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ItemPost> ItemPosts => Set<ItemPost>();
    public DbSet<ItemImage> ItemImages => Set<ItemImage>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Report> Reports => Set<Report>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<AppUser>(entity =>
        {
            entity.Property(x => x.FullName)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(x => x.CreatedAt)
                  .IsRequired();
        });

        builder.Entity<Category>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                  .IsRequired()
                  .HasMaxLength(50);

            entity.HasData(
                new Category { Id = 1, Name = "Wallet" },
                new Category { Id = 2, Name = "Phone" },
                new Category { Id = 3, Name = "Keys" },
                new Category { Id = 4, Name = "Bag" },
                new Category { Id = 5, Name = "Documents" },
                new Category { Id = 6, Name = "Watch" },
                new Category { Id = 7, Name = "Jewelry" },
                new Category { Id = 8, Name = "Other" }
            );
        });

        builder.Entity<ItemPost>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Title)
                  .IsRequired()
                  .HasMaxLength(150);

            entity.Property(x => x.Description)
                  .IsRequired()
                  .HasMaxLength(2000);

            entity.Property(x => x.Location)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.Property(x => x.CreatedAt)
                  .IsRequired();

            entity.Property(x => x.Type)
                  .IsRequired();

            entity.Property(x => x.Status)
                  .IsRequired();

            entity.Property(x => x.Color)
                  .IsRequired();

            entity.Property(x => x.EventDate)
                  .IsRequired();

            entity.HasOne(x => x.User)
                  .WithMany(x => x.ItemPosts)
                  .HasForeignKey(x => x.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Category)
                  .WithMany(x => x.ItemPosts)
                  .HasForeignKey(x => x.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ItemImage>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.ImageUrl)
                  .IsRequired()
                  .HasMaxLength(500);

            entity.Property(x => x.StoredFileName)
                  .IsRequired()
                  .HasMaxLength(255);

            entity.Property(x => x.ContentType)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(x => x.FileSize)
                  .IsRequired();

            entity.Property(x => x.CreatedAt)
                  .IsRequired();

            entity.HasOne(x => x.ItemPost)
                  .WithMany(x => x.Images)
                  .HasForeignKey(x => x.ItemPostId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Favorite>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.CreatedAt)
                  .IsRequired();

            entity.HasOne(x => x.User)
                  .WithMany()
                  .HasForeignKey(x => x.UserId)
                  .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(x => x.ItemPost)
                  .WithMany()
                  .HasForeignKey(x => x.ItemPostId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.UserId, x.ItemPostId })
                  .IsUnique();
        });

        builder.Entity<Report>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Description)
                  .HasMaxLength(1000);

            entity.Property(x => x.CreatedAt)
                  .IsRequired();

            entity.Property(x => x.Reason)
                  .IsRequired();

            entity.Property(x => x.Status)
                  .IsRequired();

            entity.HasOne(x => x.ReporterUser)
                  .WithMany(x => x.Reports)
                  .HasForeignKey(x => x.ReporterUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.ItemPost)
                  .WithMany(x => x.Reports)
                  .HasForeignKey(x => x.ItemPostId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.ReviewedByUser)
                  .WithMany(x => x.ReviewedReports)
                  .HasForeignKey(x => x.ReviewedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(x => new { x.ReporterUserId, x.ItemPostId })
                  .IsUnique();
        });
    }

}
