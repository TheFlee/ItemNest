using AutoMapper;
using FluentAssertions;
using ItemNest.Application.DTOs;
using ItemNest.Application.Mappings;
using ItemNest.Infrastructure.Services;
using ItemNest.Tests.Helpers;

namespace ItemNest.Tests.Services;

public class CategoryServiceTests
{
    private readonly IMapper _mapper;

    public CategoryServiceTests()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        _mapper = config.CreateMapper();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateCategory()
    {
        // arrange
        var context = DbContextFactory.Create();
        var service = new CategoryService(context, _mapper);

        var dto = new CreateCategoryDto
        {
            Name = "Electronics"
        };

        // act
        var result = await service.CreateAsync(dto);

        // assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Electronics");

        context.Categories.Count().Should().Be(1);
    }

    [Fact]
    public async Task CreateAsync_ShouldThrow_WhenCategoryAlreadyExists()
    {
        var context = DbContextFactory.Create();
        var service = new CategoryService(context, _mapper);

        await service.CreateAsync(new CreateCategoryDto { Name = "Books" });

        var action = async () =>
            await service.CreateAsync(new CreateCategoryDto { Name = "Books" });

        await action.Should().ThrowAsync<InvalidOperationException>();
    }
}
