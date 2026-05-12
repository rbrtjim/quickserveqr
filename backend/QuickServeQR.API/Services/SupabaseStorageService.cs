using System.Net.Http.Headers;

namespace QuickServeQR.API.Services;

public class SupabaseStorageService : IImageStorageService
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;
    private readonly string _bucket;
    private readonly string _serviceKey;

    public SupabaseStorageService(IConfiguration config, IHttpClientFactory factory)
    {
        _http       = factory.CreateClient("supabase");
        _baseUrl    = config["Supabase:Url"]!.TrimEnd('/');
        _bucket     = config["Supabase:StorageBucket"] ?? "menu-images";
        _serviceKey = config["Supabase:ServiceRoleKey"]!;
    }

    public async Task<string> SaveAsync(IFormFile file, string? existingUrl)
    {
        await DeleteAsync(existingUrl);

        var ext      = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var url      = $"{_baseUrl}/storage/v1/object/{_bucket}/{fileName}";

        using var content = new StreamContent(file.OpenReadStream());
        content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/octet-stream");

        using var req = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        req.Headers.Add("Authorization", $"Bearer {_serviceKey}");
        req.Headers.Add("apikey", _serviceKey);

        var res = await _http.SendAsync(req);
        res.EnsureSuccessStatusCode();

        return $"{_baseUrl}/storage/v1/object/public/{_bucket}/{fileName}";
    }

    public async Task DeleteAsync(string? url)
    {
        if (string.IsNullOrEmpty(url)) return;

        var prefix = $"{_baseUrl}/storage/v1/object/public/{_bucket}/";
        if (!url.StartsWith(prefix)) return;

        var fileName = url[prefix.Length..];
        using var req = new HttpRequestMessage(HttpMethod.Delete,
            $"{_baseUrl}/storage/v1/object/{_bucket}/{fileName}");
        req.Headers.Add("Authorization", $"Bearer {_serviceKey}");
        req.Headers.Add("apikey", _serviceKey);

        await _http.SendAsync(req);
    }
}
