using dotenv.net;
using ItemNest.Api.Extensions;
using ItemNest.Api.Middlewares;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using ItemNest.Infrastructure.Seed;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    var envFile = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "..", ".env"));
    DotEnv.Load(options: new DotEnvOptions(envFilePaths: [envFile], ignoreExceptions: true));
    builder.Configuration.AddEnvironmentVariables();
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerDocs();
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "https://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrations"))
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ItemNestDbContext>();
    await dbContext.Database.MigrateAsync();
}

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    await RoleSeeder.SeedAsync(roleManager);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DisplayRequestDuration();
        options.EnableFilter();
        options.EnableDeepLinking();
        options.EnableTryItOutByDefault();
    });

    using var scope = app.Services.CreateScope();
    var testDataSeeder = scope.ServiceProvider.GetRequiredService<TestDataSeeder>();
    await testDataSeeder.SeedAsync();
}

using (var scope = app.Services.CreateScope())
{
    var adminUserSeeder = scope.ServiceProvider.GetRequiredService<AdminUserSeeder>();
    await adminUserSeeder.SeedAsync();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("FrontendCorsPolicy");
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
