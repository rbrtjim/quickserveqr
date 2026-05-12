using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickServeQR.API.Models;

public class OrderItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }
    public Guid MenuItemId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public string? SpecialInstructions { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("OrderId")]
    public Order? Order { get; set; }

    [ForeignKey("MenuItemId")]
    public MenuItem? MenuItem { get; set; }
}
