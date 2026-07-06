using Amazon;
using Amazon.S3;
using FluentValidation;
using FluentValidation.AspNetCore;
using ItemNest.Application.Configurations;
using ItemNest.Application.Interfaces;
using ItemNest.Application.Mappings;
using ItemNest.Application.Validators;
using ItemNest.Infrastructure.Seed;
using ItemNest.Infrastructure.Services;

namespace ItemNest.Api.Extensions;

public static class ApplicationServicesExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAutoMapper(typeof(MappingProfile));

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IItemPostService, ItemPostService>();
        services.AddScoped<IItemImageService, ItemImageService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IContactRequestService, ContactRequestService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<TestDataSeeder>();
        services.AddScoped<AdminUserSeeder>();

        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

        services.Configure<AdminSeedSettings>(configuration.GetSection(AdminSeedSettings.SectionName));
        services.Configure<GoogleAuthSettings>(configuration.GetSection(GoogleAuthSettings.SectionName));
        services.Configure<AwsSettings>(configuration.GetSection(AwsSettings.SectionName));

        var awsSection = configuration.GetSection(AwsSettings.SectionName);
        services.AddSingleton<IAmazonS3>(_ =>
            new AmazonS3Client(
                awsSection["AccessKeyId"],
                awsSection["SecretAccessKey"],
                RegionEndpoint.GetBySystemName(awsSection["Region"] ?? "us-east-1")));

        return services;
    }
}
