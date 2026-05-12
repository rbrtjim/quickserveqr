namespace QuickServeQR.API.Services;

public interface IImageStorageService
{
    Task<string> SaveAsync(IFormFile file, string? existingUrl);
    Task DeleteAsync(string? url);
}
