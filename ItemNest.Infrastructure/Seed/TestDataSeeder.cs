using Bogus;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ItemNest.Infrastructure.Seed;

public class TestDataSeeder
{
    private readonly ItemNestDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    private static readonly Dictionary<string, string[]> CategoryImageUrls = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Wallet"] =
        [
            "https://images.unsplash.com/photo-1627384113710-424c9181ebbb?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1548531244-bc0d11d58f3c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80",
        ],
        ["Phone"] =
        [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1592899667939-3236c5e0d8e5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
        ],
        ["Keys"] =
        [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582139312050-41b18d70a1de?auto=format&fit=crop&w=800&q=80",
        ],
        ["Bag"] =
        [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=800&q=80",
        ],
        ["Documents"] =
        [
            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
        ],
        ["Watch"] =
        [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
        ],
        ["Jewelry"] =
        [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",
        ],
        ["Other"] =
        [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80",
        ],
    };

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
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
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

    private static Task<List<ItemImage>> CreateImagesAsync(List<GeneratedPostSeed> generatedPostSeeds)
    {
        var faker = new Faker();
        var images = new List<ItemImage>();

        foreach (var seed in generatedPostSeeds)
        {
            var urls = GetImageUrlsForCategory(seed.CategoryName);
            var primaryUrl = faker.PickRandom(urls);

            images.Add(new ItemImage
            {
                Id = Guid.NewGuid(),
                ItemPostId = seed.Post.Id,
                ImageUrl = primaryUrl,
                StoredFileName = string.Empty,
                ContentType = "image/jpeg",
                FileSize = 0,
                CreatedAt = seed.Post.CreatedAt
            });

            if (faker.Random.Bool(0.35f))
            {
                var remaining = urls.Where(u => u != primaryUrl).ToArray();
                var secondaryUrl = remaining.Length > 0 ? faker.PickRandom(remaining) : primaryUrl;

                images.Add(new ItemImage
                {
                    Id = Guid.NewGuid(),
                    ItemPostId = seed.Post.Id,
                    ImageUrl = secondaryUrl,
                    StoredFileName = string.Empty,
                    ContentType = "image/jpeg",
                    FileSize = 0,
                    CreatedAt = seed.Post.CreatedAt
                });
            }
        }

        return Task.FromResult(images);
    }

    private static string[] GetImageUrlsForCategory(string categoryName)
    {
        return CategoryImageUrls.TryGetValue(categoryName, out var urls)
            ? urls
            : CategoryImageUrls["Other"];
    }
}