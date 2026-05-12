using Microsoft.EntityFrameworkCore;
using QuickServeQR.API.Models;

namespace QuickServeQR.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<RestaurantTable> Tables => Set<RestaurantTable>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<StaffUser> StaffUsers => Set<StaffUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RestaurantTable>()
            .HasIndex(t => t.TableNumber).IsUnique();
        modelBuilder.Entity<RestaurantTable>()
            .HasIndex(t => t.QrCode).IsUnique();
        modelBuilder.Entity<StaffUser>()
            .HasIndex(s => s.Email).IsUnique();
    }
}
