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

            entity.HasOne(x => x.ItemPost)
                  .WithMany(x => x.Images)
                  .HasForeignKey(x => x.ItemPostId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }

}
