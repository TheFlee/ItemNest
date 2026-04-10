using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Bogus;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;
using ItemNest.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ItemNest.Infrastructure.Seed;

public class TestDataSeeder
{
    private readonly ItemNestDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly string? _unsplashKey;

    private static readonly Dictionary<string, string> CategorySearchQueries = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Wallet"]    = "leather wallet",
        ["Phone"]     = "smartphone mobile",
        ["Keys"]      = "keys keychain",
        ["Bag"]       = "backpack bag",
        ["Documents"] = "documents passport",
        ["Watch"]     = "wristwatch luxury",
        ["Jewelry"]   = "jewelry ring necklace",
        ["Other"]     = "lost item accessories",
    };

    private static readonly Dictionary<ItemColor, string> AzColorNames = new()
    {
        [ItemColor.Black] = "qara",
        [ItemColor.White] = "ağ",
        [ItemColor.Gray] = "boz",
        [ItemColor.Blue] = "mavi",
        [ItemColor.Red] = "qırmızı",
        [ItemColor.Green] = "yaşıl",
        [ItemColor.Yellow] = "sarı",
        [ItemColor.Brown] = "qəhvəyi",
        [ItemColor.Pink] = "çəhrayı",
        [ItemColor.Purple] = "bənövşəyi",
        [ItemColor.Orange] = "narıncı",
        [ItemColor.Silver] = "gümüşü",
        [ItemColor.Gold] = "qızılı",
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
        RoleManager<IdentityRole<Guid>> roleManager,
        IConfiguration configuration)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _unsplashKey = configuration["Unsplash:AccessKey"];
    }

    public async Task SeedAsync()
    {
        if (await _context.ItemPosts.AnyAsync())
            return;

        await EnsureUserRoleExistsAsync();

        var users = await EnsureUsersAsync();
        var categories = await _context.Categories.AsNoTracking().ToListAsync();
        var categoryImages = await FetchAllCategoryImagesAsync();

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

        var images = CreateImages(generatedPostSeeds, categoryImages);
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
                    "dəri cüzdan",
                    "qəhvəyi kart qabı",
                    "qara ikiqat cüzdan",
                    "kiçik sikkə cüzdanı"
                ],
                Colors = [ItemColor.Black, ItemColor.Brown, ItemColor.Gray],
                Locations =
                [
                    "28 May metro",
                    "Gənclik Mall",
                    "Nizami küçəsi",
                    "Bulvar"
                ],
                LostDetails =
                [
                    "İçərisində şəxsi kartlar və nağd pul var.",
                    "Cüzdanın içərisində bank kartları və şəxsiyyət vəsiqəsi var.",
                    "İçərisində bir neçə kart və az miqdarda pul var."
                ],
                FoundDetails =
                [
                    "Gəzinti zonasında tapıldı, təhlükəsiz saxlanıldı.",
                    "Sahibinə qaytarmaq üçün götürülüb, mühafizə edilir.",
                    "Yerdə görülüb, saxlanmaq üçün götürülüb."
                ]
            },
            new PostScenario
            {
                CategoryName = "Phone",
                ItemNames =
                [
                    "iPhone 13",
                    "Samsung Galaxy telefon",
                    "Xiaomi Redmi telefon",
                    "qara smartfon"
                ],
                Colors = [ItemColor.Black, ItemColor.Blue, ItemColor.White, ItemColor.Red],
                Locations =
                [
                    "Narimanov metro",
                    "Əhmədli metro",
                    "Gənclik metro",
                    "Xətai metro"
                ],
                LostDetails =
                [
                    "Telefonun qoruyucu qabı var, vacib şəxsi məlumatlar içindədir.",
                    "Cihaz yəqin ki, taksidə və ya oturacaqda unudulub.",
                    "Kilid ekranındakı foto onu tanımağa kömək edə bilər."
                ],
                FoundDetails =
                [
                    "Telefon söndürülmüş vəziyyətdə tapıldı, mühafizə edilir.",
                    "İctimai nəqliyyat yaxınlığında tapıldı, başqasına verilməyib.",
                    "Cihaz hal-hazırda dolu vəziyyətdə diqqətlə saxlanılır."
                ]
            },
            new PostScenario
            {
                CategoryName = "Keys",
                ItemNames =
                [
                    "ev açarları",
                    "avtomobil açar dəsti",
                    "gümüşü açar zənciricik",
                    "ofis açarları"
                ],
                Colors = [ItemColor.Silver, ItemColor.Black, ItemColor.Gray],
                Locations =
                [
                    "Əhmədli metro",
                    "Yasamal qəsəbəsi",
                    "Elmlər metro",
                    "Bina ticarət mərkəzi"
                ],
                LostDetails =
                [
                    "Açarlar kiçik açar zənciriciyinə bağlıdır.",
                    "Dəstdə bir neçə açar var, biri əsas açardır.",
                    "Açar dəsti yəqin ki, gəzərkən düşüb."
                ],
                FoundDetails =
                [
                    "Açar dəsti yolda tapıldı, mühafizə edilir.",
                    "Giriş qapısı yanında tapıldı, qaytarmaq üçün saxlanılır.",
                    "Açıq ictimai yerdə tapıldı, götürülüb."
                ]
            },
            new PostScenario
            {
                CategoryName = "Bag",
                ItemNames =
                [
                    "qara kürək çantası",
                    "noutbuk çantası",
                    "kiçik çiyin çantası",
                    "yol çantası"
                ],
                Colors = [ItemColor.Black, ItemColor.Blue, ItemColor.Gray, ItemColor.Brown],
                Locations =
                [
                    "Bakı Avtovağzalı",
                    "28 Mall",
                    "Koroğlu metro",
                    "Gənclik Mall"
                ],
                LostDetails =
                [
                    "İçərisində şəxsi əşyalar və gündəlik lazımlıqlar var.",
                    "Çantada sənədlər, zaryadlayıcılar və kiçik aksesuarlar ola bilər.",
                    "Yəqin ki, oturma yerinin yanında unudulub."
                ],
                FoundDetails =
                [
                    "Çanta sahibsiz tapıldı, salamat vəziyyətdə saxlanılır.",
                    "Sahibini tapmaq üçün dərhal götürüldü.",
                    "Bina içindəki açıq yerdə tapıldı, qorunub."
                ]
            },
            new PostScenario
            {
                CategoryName = "Documents",
                ItemNames =
                [
                    "sənəd qovluğu",
                    "pasport qabı",
                    "tələbə sənədləri",
                    "şəffaf sənəd qabı"
                ],
                Colors = [ItemColor.Blue, ItemColor.Black, ItemColor.Gray, ItemColor.Red],
                Locations =
                [
                    "ASAN xidmət mərkəzi",
                    "Sahil metro",
                    "Nizami metro",
                    "Bakı Dövlət Universiteti"
                ],
                LostDetails =
                [
                    "Qovluqda mühüm şəxsi və ya tədris sənədləri var.",
                    "Bu sənədlər şəxsən vacibdir, təcili lazımdır.",
                    "Sənədlər yəqin ki, görüş və ya qəbuldan sonra unudulub."
                ],
                FoundDetails =
                [
                    "Sənədlər bir yerdə tapıldı, quru və salamat saxlanılır.",
                    "İctimai yerdən götürüldü, sahibinə qaytarmaq üçün mühafizə edilir.",
                    "Qovluq tez fərq edildi, diqqətlə qorunub."
                ]
            },
            new PostScenario
            {
                CategoryName = "Watch",
                ItemNames =
                [
                    "gümüşü qol saatı",
                    "qara rəqəmsal saat",
                    "klassik analog saat",
                    "idman saatı"
                ],
                Colors = [ItemColor.Black, ItemColor.Silver, ItemColor.Gold, ItemColor.Blue],
                Locations =
                [
                    "Deniz Mall",
                    "Bulvar",
                    "Narimanov qəsəbəsi",
                    "idman mərkəzinin soyunma otağı"
                ],
                LostDetails =
                [
                    "Saatın sahibi üçün emosional dəyəri var.",
                    "Gün ərzində çıxarılıb unudula bilərdi.",
                    "Hərəkət və ya idman zamanı itirilmiş ola bilər."
                ],
                FoundDetails =
                [
                    "Saat bütöv vəziyyətdə tapıldı, mühafizə edilir.",
                    "Tez fərq edildi, etibarlı yerə götürüldü.",
                    "Yaxşı vəziyyətdə tapıldı, qorunub."
                ]
            },
            new PostScenario
            {
                CategoryName = "Jewelry",
                ItemNames =
                [
                    "qızıl üzük",
                    "gümüşü qolbaq",
                    "kiçik boyunbağı",
                    "sırğa dəsti"
                ],
                Colors = [ItemColor.Gold, ItemColor.Silver, ItemColor.Pink],
                Locations =
                [
                    "toy salonu yanındakı dayanacaq",
                    "Nizami küçəsi",
                    "ticarət mərkəzi tualet otağı",
                    "gözəllik salonu girişi"
                ],
                LostDetails =
                [
                    "Əşyanın yüksək şəxsi və emosional dəyəri var.",
                    "Fərq edilmədən düşmüş ola bilər.",
                    "Zinət əşyası kiçikdir, asan nəzərdən qaçır."
                ],
                FoundDetails =
                [
                    "Zinət əşyası tapıldı, itirməmək üçün mühafizə edildi.",
                    "Diqqətlə götürüldü, təhlükəsiz saxlanılır.",
                    "Təmiz qapalı yerdə tapıldı."
                ]
            },
            new PostScenario
            {
                CategoryName = "Other",
                ItemNames =
                [
                    "simsiz qulaqlıq qutusu",
                    "güc bankı",
                    "günəş eynəyi",
                    "USB flaş kart"
                ],
                Colors = [ItemColor.Black, ItemColor.White, ItemColor.Blue, ItemColor.Gray],
                Locations =
                [
                    "Fontan Meydanı yanındakı kafe",
                    "metro keçidi",
                    "ofis binasının lobbisi",
                    "şəhər avtobusu dayanacağı"
                ],
                LostDetails =
                [
                    "Əşya gündəlik istifadə üçündür, sahibi aktiv axtarır.",
                    "Masada və ya oturacaqda unudulmuş ola bilər.",
                    "Qısa dayanacaq zamanı yerini dəyişib."
                ],
                FoundDetails =
                [
                    "Əşya qoyulduqdan qısa müddət sonra tapıldı.",
                    "Sahibinə qaytarmaq üçün diqqətlə götürüldü.",
                    "İctimai yerdə tapıldı, qorunub."
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
        string subject;

        if (color != ItemColor.Unknown && AzColorNames.TryGetValue(color, out var azColor))
        {
            var raw = $"{azColor} {itemName}";
            subject = char.ToUpper(raw[0]) + raw[1..];
        }
        else
        {
            subject = char.ToUpper(itemName[0]) + itemName[1..];
        }

        return type == PostType.Lost
            ? $"{subject} itirildi — {location} yaxınlığında"
            : $"{subject} tapıldı — {location} yaxınlığında";
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
            ? $"{location} ətrafında {itemName} itirdim."
            : $"{location} ətrafında {itemName} tapdım.";

        var colorPart = color == ItemColor.Unknown || !AzColorNames.TryGetValue(color, out var azColor)
            ? "Rəngi dəqiq bilinmir."
            : $"Rəngi {azColor}dir.";

        var detail = type == PostType.Lost
            ? faker.PickRandom(scenario.LostDetails)
            : faker.PickRandom(scenario.FoundDetails);

        var closing = type == PostType.Lost
            ? "Məlumatınız varsa, əlaqə saxlayın."
            : "Bu əşyanın sizə aid olduğunu düşünürsünüzsə, əlaqə saxlayın.";

        return $"{opening} {colorPart} {detail} {closing}";
    }

    private static List<ItemImage> CreateImages(
        List<GeneratedPostSeed> generatedPostSeeds,
        Dictionary<string, string[]> categoryImages)
    {
        var faker = new Faker();
        var images = new List<ItemImage>();

        foreach (var seed in generatedPostSeeds)
        {
            var urls = categoryImages.TryGetValue(seed.CategoryName, out var u) ? u
                : categoryImages.TryGetValue("Other", out var fallback) ? fallback
                : [];

            if (urls.Length == 0)
                continue;

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

        return images;
    }

    private async Task<Dictionary<string, string[]>> FetchAllCategoryImagesAsync()
    {
        var result = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(_unsplashKey))
        {
            foreach (var category in CategorySearchQueries.Keys)
                result[category] = [];

            return result;
        }

        using var http = new HttpClient();
        http.DefaultRequestHeaders.Add("Authorization", $"Client-ID {_unsplashKey}");
        http.DefaultRequestHeaders.Add("Accept-Version", "v1");

        foreach (var (category, query) in CategorySearchQueries)
        {
            try
            {
                var url = $"https://api.unsplash.com/photos/random?query={Uri.EscapeDataString(query)}&count=3&orientation=landscape";
                var photos = await http.GetFromJsonAsync<UnsplashPhoto[]>(url);

                result[category] = photos?
                    .Select(p => p.Urls.Regular)
                    .Where(u => !string.IsNullOrEmpty(u))
                    .ToArray() ?? [];
            }
            catch
            {
                result[category] = [];
            }
        }

        return result;
    }

    private sealed record UnsplashPhoto(
        [property: JsonPropertyName("urls")] UnsplashPhotoUrls Urls);

    private sealed record UnsplashPhotoUrls(
        [property: JsonPropertyName("regular")] string Regular);
}