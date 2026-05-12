using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickServeQR.API.Models;

public class Order
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TableId { get; set; }

    public int OrderNumber { get; set; }

    public string Status { get; set; } = "Pending";

    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }

    public string? Notes { get; set; }

    public string PaymentStatus { get; set; } = "Unpaid";
    public string? PaymentMethod { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("TableId")]
    public RestaurantTable? Table { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}