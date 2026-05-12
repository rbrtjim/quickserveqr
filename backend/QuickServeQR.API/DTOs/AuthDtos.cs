namespace QuickServeQR.API.DTOs;

public record LoginDto(string Email, string Password);
public record RegisterDto(string Email, string Password, string FullName, string Role);
public record AuthResponseDto(string Token, string Email, string FullName, string Role);