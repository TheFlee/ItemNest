using AutoMapper;
using ItemNest.Application.DTOs;
using ItemNest.Domain.Entities;
using ItemNest.Domain.Enums;

namespace ItemNest.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Category
        CreateMap<Category, CategoryDto>();

        CreateMap<CreateCategoryDto, Category>()
            .ForMember(dest => dest.Name,
                       opt => opt.MapFrom(src => src.Name.Trim()));

        // Auth
        CreateMap<RegisterDto, AppUser>()
            .ForMember(dest => dest.UserName,
                        opt => opt.MapFrom(src => src.Email.Trim()))
            .ForMember(dest => dest.Email,
                        opt => opt.MapFrom(src => src.Email.Trim()))
            .ForMember(dest => dest.FullName,
                        opt => opt.MapFrom(src => src.FullName.Trim()))
            .ForMember(dest => dest.CreatedAt,
                        opt => opt.MapFrom(_ => DateTimeOffset.UtcNow));

        // ItemPost
        CreateMap<CreateItemPostDto, ItemPost>()
            .ForMember(dest => dest.CreatedAt,
                        opt => opt.MapFrom(_ => DateTimeOffset.UtcNow))
            .ForMember(dest => dest.Status,
                        opt => opt.MapFrom(_ => PostStatus.Open));

        CreateMap<ItemPost, ItemPostDto>()
            .ForMember(dest => dest.CategoryName,
                        opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.UserFullName,
                        opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.Images,
                        opt => opt.MapFrom(src => src.Images));

        CreateMap<UpdateItemPostDto, ItemPost>()
            .ForMember(dest => dest.UpdatedAt,
                        opt => opt.MapFrom(_ => DateTimeOffset.UtcNow));
        // ItemImage
        CreateMap<ItemImage, ItemImageDto>();

        // Report
        CreateMap<Report, ReportDto>()
            .ForMember(dest => dest.ReporterFullName,
                        opt => opt.MapFrom(src => src.ReporterUser.FullName))
            .ForMember(dest => dest.ItemPostTitle,
                        opt => opt.MapFrom(src => src.ItemPost.Title));
    }
}
