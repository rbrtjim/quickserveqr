namespace QuickServeQR.API.DTOs;

public record CategoryResponseDto(
    Guid Id, string Name, string? Description, int SortOrder, bool IsActive,
    List<MenuItemResponseDto> MenuItems
);

public record MenuItemResponseDto(
    Guid Id, Guid CategoryId, string CategoryName, string Name,
    string? Description, decimal Price, string? ImageUrl, bool IsAvailable,
    int PreparationTime, int? Calories, string[]? Tags
);

public record CreateMenuItemDto(
    Guid CategoryId, string Name, string? Description, decimal Price,
    string? ImageUrl, int PreparationTime, int? Calories, string[]? Tags
);

public record UpdateMenuItemDto(
    string? Name, string? Description, decimal? Price, string? ImageUrl,
    bool? IsAvailable, int? PreparationTime, int? Calories, string[]? Tags
);

public record CreateCategoryDto(string Name, string? Description, int SortOrder);
