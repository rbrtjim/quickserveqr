using System.ComponentModel.DataAnnotations;

namespace QuickServeQR.API.Models;

public class RestaurantTable
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public int TableNumber { get; set; }

    [Required]
    public string QrCode { get; set; } = string.Empty;

    public int Seats { get; set; } = 4;

    public bool IsOccupied { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
