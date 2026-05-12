using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuickServeQR.API.Data;
using QuickServeQR.API.DTOs;
using QuickServeQR.API.Models;

namespace QuickServeQR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config) { _db = db; _config = config; }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
    {
        var user = await _db.StaffUsers.FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);
        if (user == null) return Unauthorized("Invalid email or password");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password");

        var token = GenerateJwt(user.Id.ToString(), user.Email, user.Role);
        return Ok(new AuthResponseDto(token, user.Email, user.FullName, user.Role));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
    {
        // Validate role
        var allowedRoles = new[] { "Admin", "Kitchen", "Waiter", "Cashier" };
        if (!allowedRoles.Contains(dto.Role))
            return BadRequest("Invalid role. Allowed: Admin, Kitchen, Waiter, Cashier");

        // Validate email
        if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains('@'))
            return BadRequest("Invalid email address");

        // Validate password
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest("Password must be at least 6 characters");

        // Validate name
        if (string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest("Full name is required");

        // Check if email already exists
        var exists = await _db.StaffUsers.AnyAsync(u => u.Email == dto.Email);
        if (exists) return Conflict("An account with this email already exists");

        var user = new StaffUser
        {
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName.Trim(),
            Role = dto.Role
        };

        _db.StaffUsers.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwt(user.Id.ToString(), user.Email, user.Role);
        return CreatedAtAction(nameof(Login), new AuthResponseDto(token, user.Email, user.FullName, user.Role));
    }

    private string GenerateJwt(string userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: new[] {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            },
            expires: DateTime.UtcNow.AddMinutes(double.Parse(_config["Jwt:ExpiryMinutes"]!)),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}