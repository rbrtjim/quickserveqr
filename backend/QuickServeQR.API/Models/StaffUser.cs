using System.ComponentModel.DataAnnotations;

namespace QuickServeQR.API.Models;

public class StaffUser
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    public string Role { get; set; } = "Waiter";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
