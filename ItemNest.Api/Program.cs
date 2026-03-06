using ItemNest.Api.Middlewares;
using ItemNest.Application.Interfaces;
using ItemNest.Application.Mappings;
using ItemNest.Domain.Entities;
using ItemNest.Infrastructure.Data;
using ItemNest.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ItemNest API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT token daxil edin. Nümunə: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ItemNestDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<ItemNestDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IItemPostService, ItemPostService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.EnableTryItOutByDefault();
        options.EnableDeepLinking();
        options.EnableFilter();
    });
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
