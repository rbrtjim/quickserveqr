using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuickServeQR.API.Models;

public class MenuItem
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CategoryId { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;

    public int PreparationTime { get; set; } = 15;

    public int? Calories { get; set; }

    /// <summary>Comma-separated tags, e.g. "spicy,vegan,gluten-free"</summary>
    public string? Tags { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }
}
