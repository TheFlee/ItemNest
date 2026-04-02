using Bogus;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;

namespace ItemNest.Infrastructure.Seed;

public class TestDataSeeder
{
    private readonly ItemNestDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IWebHostEnvironment _environment;

    private sealed class PostScenario
    {
        public string CategoryName { get; init; } = string.Empty;
        public string[] ItemNames { get; init; } = [];
        public ItemColor[] Colors { get; init; } = [];
        public string[] Locations { get; init; } = [];
        public string[] LostDetails { get; init; } = [];
        public string[] FoundDetails { get; init; } = [];
    }

    private sealed class GeneratedPostSeed
    {
        public ItemPost Post { get; init; } = null!;
        public string CategoryName { get; init; } = string.Empty;
        public string ItemName { get; init; } = string.Empty;
        public string Location { get; init; } = string.Empty;
        public ItemColor Color { get; init; }
    }

    public TestDataSeeder(
        ItemNestDbContext context,
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IWebHostEnvironment environment)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _environment = environment;
    }

    public async Task SeedAsync()
    {
        if (await _context.ItemPosts.AnyAsync())
            return;

        await EnsureUserRoleExistsAsync();

        var users = await EnsureUsersAsync();
        var categories = await _context.Categories.AsNoTracking().ToListAsync();

        if (categories.Count == 0)
            throw new InvalidOperationException("Categories were not found. Seed categories first.");

        var categoryMap = categories.ToDictionary(x => x.Name, x => x, StringComparer.OrdinalIgnoreCase);
        var scenarios = BuildScenarios();

        var faker = new Faker();
        var heavyUserPool = BuildHeavyUserPool(users);
        var generatedPostSeeds = new List<GeneratedPostSeed>();

        foreach (var scenario in scenarios)
        {
            if (!categoryMap.TryGetValue(scenario.CategoryName, out var category))
                continue;

            var postsForCategory = faker.Random.Int(18, 28);

            for (var i = 0; i < postsForCategory; i++)
            {
                var type = faker.Random.Bool(0.58f) ? PostType.Lost : PostType.Found;
                var itemName = faker.PickRandom(scenario.ItemNames);
                var location = faker.PickRandom(scenario.Locations);
                var color = faker.PickRandom(scenario.Colors);
                var owner = faker.PickRandom(heavyUserPool);

                var createdAt = faker.Date.RecentOffset(45);
                var eventDate = createdAt.AddHours(-faker.Random.Int(2, 240));

                var status = faker.Random.Float() switch
                {
                    < 0.72f => PostStatus.Open,
                    < 0.88f => PostStatus.Returned,
                    _ => PostStatus.Closed
                };

                var post = new ItemPost
                {
                    Id = Guid.NewGuid(),
                    Title = BuildTitle(type, color, itemName, location),
                    Description = BuildDescription(faker, scenario, type, color, itemName, location),
                    Type = type,
                    Status = status,
                    Color = color,
                    Location = location,
                    EventDate = eventDate,
                    CreatedAt = createdAt,
                    UpdatedAt = status == PostStatus.Open
                        ? null
                        : createdAt.AddHours(faker.Random.Int(6, 120)),
                    UserId = owner.Id,
                    CategoryId = category.Id
                };

                generatedPostSeeds.Add(new GeneratedPostSeed
                {
                    Post = post,
                    CategoryName = scenario.CategoryName,
                    ItemName = itemName,
                    Location = location,
                    Color = color
                });
            }
        }

        await _context.ItemPosts.AddRangeAsync(generatedPostSeeds.Select(x => x.Post));
        await _context.SaveChangesAsync();

        var images = await CreateImagesAsync(generatedPostSeeds);
        await _context.ItemImages.AddRangeAsync(images);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureUserRoleExistsAsync()
    {
        if (!await _roleManager.RoleExistsAsync(AppRoles.User))
        {
            var result = await _roleManager.CreateAsync(new IdentityRole<Guid>(AppRoles.User));

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(x => x.Description));
                throw new InvalidOperationException($"Failed to create '{AppRoles.User}' role. {errors}");
            }
        }
    }

    private async Task<List<AppUser>> EnsureUsersAsync()
    {
        var users = await _context.Users.ToListAsync();

        var curatedUsers = new[]
        {
            ("Aylin Mammadova", "aylin.mammadova@itemnest.test"),
            ("Murad Aliyev", "murad.aliyev@itemnest.test"),
            ("Nigar Hasanli", "nigar.hasanli@itemnest.test"),
            ("Orkhan Guliyev", "orkhan.guliyev@itemnest.test"),
            ("Leyla Ibrahimova", "leyla.ibrahimova@itemnest.test"),
            ("Tural Jafarov", "tural.jafarov@itemnest.test"),
            ("Sabina Rustamli", "sabina.rustamli@itemnest.test"),
            ("Kamran Safarov", "kamran.safarov@itemnest.test"),
            ("Emil Ahmadov", "emil.ahmadov@itemnest.test"),
            ("Fidan Karimova", "fidan.karimova@itemnest.test")
        };

        foreach (var (fullName, email) in curatedUsers)
        {
            if (users.Any(x => string.Equals(x.Email, email, StringComparison.OrdinalIgnoreCase)))
                continue;

            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                FullName = fullName,
                Email = email,
                UserName = email,
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-Random.Shared.Next(20, 180))
            };

            var createResult = await _userManager.CreateAsync(user, "Password123!");

            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(x => x.Description));
                throw new InvalidOperationException($"Failed to create seeded user '{email}'. {errors}");
            }

            var addRoleResult = await _userManager.AddToRoleAsync(user, AppRoles.User);

            if (!addRoleResult.Succeeded)
            {
                var errors = string.Join("; ", addRoleResult.Errors.Select(x => x.Description));
                throw new InvalidOperationException($"Failed to add seeded user '{email}' to role. {errors}");
            }

            users.Add(user);
        }

        var targetUserCount = 28;
        var nextIndex = 1;

        while (users.Count < targetUserCount)
        {
            var email = $"test.user{nextIndex:D2}@itemnest.test";

            if (users.Any(x => string.Equals(x.Email, email, StringComparison.OrdinalIgnoreCase)))
            {
                nextIndex++;
                continue;
            }

            var faker = new Faker();
            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                FullName = faker.Name.FullName(),
                Email = email,
                UserName = email,
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-Random.Shared.Next(10, 180))
            };

            var createResult = await _userManager.CreateAsync(user, "Password123!");

            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(x => x.Description));
                throw new InvalidOperationException($"Failed to create generated user '{email}'. {errors}");
            }

            var addRoleResult = await _userManager.AddToRoleAsync(user, AppRoles.User);

            if (!addRoleResult.Succeeded)
            {
                var errors = string.Join("; ", addRoleResult.Errors.Select(x => x.Description));
                throw new InvalidOperationException($"Failed to add generated user '{email}' to role. {errors}");
            }

            users.Add(user);
            nextIndex++;
        }

        return users;
    }

    private static List<AppUser> BuildHeavyUserPool(List<AppUser> users)
    {
        var orderedUsers = users.OrderBy(x => x.CreatedAt).ToList();

        if (orderedUsers.Count <= 6)
            return orderedUsers;

        var heavyUsers = orderedUsers.Take(8).ToList();
        var pool = new List<AppUser>();

        pool.AddRange(heavyUsers);
        pool.AddRange(heavyUsers);
        pool.AddRange(orderedUsers);

        return pool;
    }

    private static List<PostScenario> BuildScenarios()
    {
        return
        [
            new PostScenario
            {
                CategoryName = "Wallet",
                ItemNames =
                [
                    "leather wallet",
                    "brown card holder",
                    "black bifold wallet",
                    "small coin wallet"
                ],
                Colors = [ItemColor.Black, ItemColor.Brown, ItemColor.Gray],
                Locations =
                [
                    "28 May metro",
                    "Ganjlik Mall",
                    "Nizami Street",
                    "Baku Boulevard"
                ],
                LostDetails =
                [
                    "It contains personal cards and some cash.",
                    "The wallet has bank cards and an ID inside.",
                    "There are several cards and a small amount of money inside."
                ],
                FoundDetails =
                [
                    "It was found near the walking area and kept safely.",
                    "The item was picked up and stored to return to the owner.",
                    "It was noticed on the ground and taken for safekeeping."
                ]
            },
            new PostScenario
            {
                CategoryName = "Phone",
                ItemNames =
                [
                    "iPhone 13",
                    "Samsung Galaxy phone",
                    "Xiaomi Redmi phone",
                    "black smartphone"
                ],
                Colors = [ItemColor.Black, ItemColor.Blue, ItemColor.White, ItemColor.Red],
                Locations =
                [
                    "Narimanov metro",
                    "Azadliq Avenue",
                    "Ganjlik metro",
                    "Khatai Park"
                ],
                LostDetails =
                [
                    "The phone has a protective case and important personal data.",
                    "The device was likely left in a taxi or on a bench.",
                    "There is a lock screen photo that can help identify it."
                ],
                FoundDetails =
                [
                    "The phone was found switched off and kept safe.",
                    "It was found near public transport and not handed to anyone else.",
                    "The device is currently charged and stored carefully."
                ]
            },
            new PostScenario
            {
                CategoryName = "Keys",
                ItemNames =
                [
                    "house keys",
                    "car key set",
                    "silver keychain",
                    "office keys"
                ],
                Colors = [ItemColor.Silver, ItemColor.Black, ItemColor.Gray],
                Locations =
                [
                    "Ahmadli metro",
                    "Yasamal district",
                    "Elmler metro",
                    "Bina shopping center"
                ],
                LostDetails =
                [
                    "The keys are attached to a small keychain.",
                    "The set includes several keys and one main key.",
                    "The key set may have been dropped while walking."
                ],
                FoundDetails =
                [
                    "The key set was found on the pavement and collected safely.",
                    "It was found near the entrance area and kept to return.",
                    "The keys were discovered in a visible public place."
                ]
            },
            new PostScenario
            {
                CategoryName = "Bag",
                ItemNames =
                [
                    "black backpack",
                    "laptop bag",
                    "small shoulder bag",
                    "travel bag"
                ],
                Colors = [ItemColor.Black, ItemColor.Blue, ItemColor.Gray, ItemColor.Brown],
                Locations =
                [
                    "Baku Bus Terminal",
                    "28 Mall",
                    "Khirdalan station",
                    "Ganjlik Mall"
                ],
                LostDetails =
                [
                    "It contains personal belongings and daily essentials.",
                    "The bag may include documents, chargers, and small accessories.",
                    "It was likely left near a seating area."
                ],
                FoundDetails =
                [
                    "The bag was found unattended and kept in safe condition.",
                    "It was collected immediately to help identify the owner.",
                    "The item was found indoors and protected from damage."
                ]
            },
            new PostScenario
            {
                CategoryName = "Documents",
                ItemNames =
                [
                    "document folder",
                    "passport cover",
                    "student documents",
                    "clear file holder"
                ],
                Colors = [ItemColor.Blue, ItemColor.Black, ItemColor.Gray, ItemColor.Red],
                Locations =
                [
                    "ASAN Service center area",
                    "Sahil metro",
                    "Nizami metro",
                    "university campus"
                ],
                LostDetails =
                [
                    "The folder contains important identification or academic papers.",
                    "These documents are personally important and urgently needed.",
                    "The papers were likely left after a meeting or appointment."
                ],
                FoundDetails =
                [
                    "The documents were found together and kept dry and safe.",
                    "They were collected from a public place to return to the owner.",
                    "The folder was noticed quickly and preserved carefully."
                ]
            },
            new PostScenario
            {
                CategoryName = "Watch",
                ItemNames =
                [
                    "silver wristwatch",
                    "black digital watch",
                    "classic analog watch",
                    "sport watch"
                ],
                Colors = [ItemColor.Black, ItemColor.Silver, ItemColor.Gold, ItemColor.Blue],
                Locations =
                [
                    "Deniz Mall",
                    "Baku Boulevard",
                    "Narimanov district",
                    "fitness center locker room"
                ],
                LostDetails =
                [
                    "The watch has sentimental value for the owner.",
                    "It may have been removed and forgotten during the day.",
                    "The watch was likely lost during movement or exercise."
                ],
                FoundDetails =
                [
                    "The watch was found intact and kept safely.",
                    "It was noticed quickly and taken to a secure place.",
                    "The item was found in good condition and preserved."
                ]
            },
            new PostScenario
            {
                CategoryName = "Jewelry",
                ItemNames =
                [
                    "gold ring",
                    "silver bracelet",
                    "small necklace",
                    "earring set"
                ],
                Colors = [ItemColor.Gold, ItemColor.Silver, ItemColor.Pink],
                Locations =
                [
                    "wedding hall parking area",
                    "Nizami Street",
                    "shopping center restroom",
                    "beauty salon entrance"
                ],
                LostDetails =
                [
                    "The item has high personal and emotional value.",
                    "It may have slipped off without being noticed immediately.",
                    "The jewelry piece is small and easy to miss."
                ],
                FoundDetails =
                [
                    "The jewelry item was found and protected from being lost again.",
                    "It was collected carefully and stored safely.",
                    "The item was found in a clean indoor area."
                ]
            },
            new PostScenario
            {
                CategoryName = "Other",
                ItemNames =
                [
                    "wireless earbuds case",
                    "power bank",
                    "sunglasses",
                    "USB flash drive"
                ],
                Colors = [ItemColor.Black, ItemColor.White, ItemColor.Blue, ItemColor.Gray],
                Locations =
                [
                    "coffee shop near Fountain Square",
                    "metro underpass",
                    "office building lobby",
                    "city bus route stop"
                ],
                LostDetails =
                [
                    "The item is used daily and the owner is actively looking for it.",
                    "It may have been left on a table or seat.",
                    "The item was likely misplaced during a short stop."
                ],
                FoundDetails =
                [
                    "The item was found shortly after being left behind.",
                    "It was picked up and stored carefully for return.",
                    "The item was found in a public space and kept safe."
                ]
            }
        ];
    }

    private static string BuildTitle(
        PostType type,
        ItemColor color,
        string itemName,
        string location)
    {
        var colorText = color == ItemColor.Unknown ? string.Empty : $"{color.ToString().ToLower()} ";

        return type == PostType.Lost
            ? $"Lost {colorText}{itemName} near {location}"
            : $"Found {colorText}{itemName} near {location}";
    }

    private static string BuildDescription(
        Faker faker,
        PostScenario scenario,
        PostType type,
        ItemColor color,
        string itemName,
        string location)
    {
        var opening = type == PostType.Lost
            ? $"I lost my {itemName} around {location}."
            : $"I found a {itemName} around {location}.";

        var colorPart = color == ItemColor.Unknown
            ? "The exact color is not fully confirmed."
            : $"Its color is {color.ToString().ToLower()}.";

        var detail = type == PostType.Lost
            ? faker.PickRandom(scenario.LostDetails)
            : faker.PickRandom(scenario.FoundDetails);

        var closing = type == PostType.Lost
            ? "Please contact me if you have any information."
            : "Please contact me if you believe this item belongs to you.";

        return $"{opening} {colorPart} {detail} {closing}";
    }

    private async Task<List<ItemImage>> CreateImagesAsync(List<GeneratedPostSeed> generatedPostSeeds)
    {
        var webRootPath = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRootPath))
        {
            webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadFolder = Path.Combine(webRootPath, "uploads", "itemposts");
        Directory.CreateDirectory(uploadFolder);

        var images = new List<ItemImage>();
        var faker = new Faker();

        foreach (var seed in generatedPostSeeds)
        {
            var primaryImage = CreateSingleImage(seed, uploadFolder, "main");
            images.Add(primaryImage);

            if (faker.Random.Bool(0.35f))
            {
                var secondaryImage = CreateSingleImage(seed, uploadFolder, "extra");
                images.Add(secondaryImage);
            }
        }

        return await Task.FromResult(images);
    }

    private ItemImage CreateSingleImage(
        GeneratedPostSeed seed,
        string uploadFolder,
        string variant)
    {
        var storedFileName = $"{Guid.NewGuid()}.svg";
        var fullPath = Path.Combine(uploadFolder, storedFileName);
        var svg = BuildSvg(seed, variant);
        var bytes = Encoding.UTF8.GetBytes(svg);

        File.WriteAllBytes(fullPath, bytes);

        return new ItemImage
        {
            Id = Guid.NewGuid(),
            ItemPostId = seed.Post.Id,
            ImageUrl = $"/uploads/itemposts/{storedFileName}",
            StoredFileName = storedFileName,
            ContentType = "image/svg+xml",
            FileSize = bytes.Length,
            CreatedAt = seed.Post.CreatedAt
        };
    }

    private static string BuildSvg(GeneratedPostSeed seed, string variant)
    {
        var background = seed.Color switch
        {
            ItemColor.Black => "#111827",
            ItemColor.White => "#F8FAFC",
            ItemColor.Gray => "#CBD5E1",
            ItemColor.Blue => "#DBEAFE",
            ItemColor.Red => "#FEE2E2",
            ItemColor.Green => "#DCFCE7",
            ItemColor.Yellow => "#FEF3C7",
            ItemColor.Brown => "#E7D3C2",
            ItemColor.Pink => "#FCE7F3",
            ItemColor.Purple => "#EDE9FE",
            ItemColor.Orange => "#FFEDD5",
            ItemColor.Silver => "#E5E7EB",
            ItemColor.Gold => "#FEF08A",
            _ => "#F1F5F9"
        };

        var accent = seed.Post.Type == PostType.Lost ? "#DC2626" : "#059669";
        var text = seed.Color is ItemColor.Black or ItemColor.Blue ? "#FFFFFF" : "#0F172A";
        var title = WebUtility.HtmlEncode(seed.ItemName);
        var category = WebUtility.HtmlEncode(seed.CategoryName);
        var location = WebUtility.HtmlEncode(seed.Location);
        var variantLabel = variant == "extra" ? "Additional View" : "Seeded Preview";

        return $"""
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="{background}" />
  <rect x="60" y="60" width="1080" height="780" rx="32" fill="rgba(255,255,255,0.72)" />

  <text x="90" y="235" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="700" fill="{text}">{title}</text>
  <text x="90" y="310" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="{text}">{category}</text>
  <text x="90" y="365" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="{text}">{location}</text>

  <rect x="90" y="640" width="360" height="110" rx="24" fill="{accent}" />
  <text x="270" y="700" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">{variantLabel}</text>

  <circle cx="925" cy="370" r="165" fill="{accent}" opacity="0.14" />
  <circle cx="985" cy="435" r="115" fill="{accent}" opacity="0.22" />
  <circle cx="865" cy="470" r="85" fill="{accent}" opacity="0.28" />
</svg>
""";
    }
}