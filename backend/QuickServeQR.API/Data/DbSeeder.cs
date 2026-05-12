using QuickServeQR.API.Models;

namespace QuickServeQR.API.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Categories.Any()) return; // Already seeded

        // Categories
        var appetizers = new Category { Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"), Name = "Appetizers", Description = "Start your meal right", SortOrder = 1 };
        var mains     = new Category { Id = Guid.Parse("a1000000-0000-0000-0000-000000000002"), Name = "Main Course", Description = "Hearty main dishes", SortOrder = 2 };
        var desserts  = new Category { Id = Guid.Parse("a1000000-0000-0000-0000-000000000003"), Name = "Desserts", Description = "Sweet endings", SortOrder = 3 };
        var beverages = new Category { Id = Guid.Parse("a1000000-0000-0000-0000-000000000004"), Name = "Beverages", Description = "Refreshing drinks", SortOrder = 4 };
        var salads    = new Category { Id = Guid.Parse("a1000000-0000-0000-0000-000000000005"), Name = "Salads", Description = "Fresh and healthy", SortOrder = 5 };

        db.Categories.AddRange(appetizers, mains, desserts, beverages, salads);

        // Menu Items
        db.MenuItems.AddRange(
            new MenuItem { CategoryId = appetizers.Id, Name = "Spring Rolls", Description = "Crispy vegetable spring rolls with sweet chili sauce", Price = 6.99m, PreparationTime = 10, Calories = 220, Tags = "vegetarian" },
            new MenuItem { CategoryId = appetizers.Id, Name = "Garlic Bread", Description = "Toasted bread with garlic butter and herbs", Price = 4.99m, PreparationTime = 8, Calories = 180, Tags = "vegetarian" },
            new MenuItem { CategoryId = appetizers.Id, Name = "Chicken Wings", Description = "Spicy buffalo chicken wings with ranch dip", Price = 9.99m, PreparationTime = 15, Calories = 450, Tags = "spicy" },
            new MenuItem { CategoryId = appetizers.Id, Name = "Mozzarella Sticks", Description = "Breaded mozzarella with marinara sauce", Price = 7.99m, PreparationTime = 10, Calories = 350, Tags = "vegetarian" },
            new MenuItem { CategoryId = mains.Id, Name = "Grilled Salmon", Description = "Atlantic salmon with lemon butter sauce and vegetables", Price = 18.99m, PreparationTime = 20, Calories = 520, Tags = "gluten-free" },
            new MenuItem { CategoryId = mains.Id, Name = "Ribeye Steak", Description = "Premium 12oz ribeye with mashed potatoes", Price = 24.99m, PreparationTime = 25, Calories = 750, Tags = "gluten-free" },
            new MenuItem { CategoryId = mains.Id, Name = "Chicken Alfredo", Description = "Fettuccine pasta with creamy alfredo and grilled chicken", Price = 14.99m, PreparationTime = 18, Calories = 680 },
            new MenuItem { CategoryId = mains.Id, Name = "Margherita Pizza", Description = "Classic pizza with fresh mozzarella, tomato, and basil", Price = 12.99m, PreparationTime = 15, Calories = 550, Tags = "vegetarian" },
            new MenuItem { CategoryId = mains.Id, Name = "Fish and Chips", Description = "Beer-battered cod with crispy fries and tartar sauce", Price = 13.99m, PreparationTime = 15, Calories = 620 },
            new MenuItem { CategoryId = desserts.Id, Name = "Chocolate Lava Cake", Description = "Warm chocolate cake with molten center", Price = 8.99m, PreparationTime = 12, Calories = 480, Tags = "vegetarian" },
            new MenuItem { CategoryId = desserts.Id, Name = "Tiramisu", Description = "Classic Italian coffee-flavored dessert", Price = 7.99m, PreparationTime = 5, Calories = 350, Tags = "vegetarian" },
            new MenuItem { CategoryId = desserts.Id, Name = "Cheesecake", Description = "New York style cheesecake with berry compote", Price = 8.49m, PreparationTime = 5, Calories = 400, Tags = "vegetarian" },
            new MenuItem { CategoryId = beverages.Id, Name = "Fresh Orange Juice", Description = "Freshly squeezed orange juice", Price = 4.49m, PreparationTime = 3, Calories = 110, Tags = "vegan,gluten-free" },
            new MenuItem { CategoryId = beverages.Id, Name = "Iced Coffee", Description = "Cold brew coffee with ice", Price = 3.99m, PreparationTime = 3, Calories = 50, Tags = "vegan,gluten-free" },
            new MenuItem { CategoryId = beverages.Id, Name = "Mango Smoothie", Description = "Blended mango with yogurt and honey", Price = 5.99m, PreparationTime = 5, Calories = 200, Tags = "vegetarian,gluten-free" },
            new MenuItem { CategoryId = beverages.Id, Name = "Sparkling Water", Description = "Chilled sparkling mineral water", Price = 2.49m, PreparationTime = 1, Calories = 0, Tags = "vegan,gluten-free" },
            new MenuItem { CategoryId = salads.Id, Name = "Caesar Salad", Description = "Romaine lettuce with Caesar dressing and croutons", Price = 9.99m, PreparationTime = 8, Calories = 280 },
            new MenuItem { CategoryId = salads.Id, Name = "Greek Salad", Description = "Mixed greens with feta, olives, and vinaigrette", Price = 10.49m, PreparationTime = 8, Calories = 250, Tags = "vegetarian,gluten-free" }
        );

        // Tables (1-10: regular, 11-14: big tables for 4 pax)
        for (int i = 1; i <= 14; i++)
        {
            int seats;
            if (i <= 2) seats = 2;
            else if (i <= 5) seats = 4;
            else if (i <= 8) seats = 6;
            else if (i == 9) seats = 4;
            else if (i == 10) seats = 10;
            else seats = 4; // Tables 11-14: big tables for 4 pax

            db.Tables.Add(new RestaurantTable
            {
                TableNumber = i,
                QrCode = $"QS-TABLE-{i:D3}",
                Seats = seats
            });
        }

        // Staff Users (BCrypt hashed passwords)
        db.StaffUsers.AddRange(
            new StaffUser { Email = "admin@quickserve.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), FullName = "Admin User", Role = "Admin" },
            new StaffUser { Email = "kitchen@quickserve.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Kitchen123!"), FullName = "Kitchen Staff", Role = "Kitchen" },
            new StaffUser { Email = "waiter@quickserve.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Waiter123!"), FullName = "Waiter Staff", Role = "Waiter" },
            new StaffUser { Email = "cashier@quickserve.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cashier123!"), FullName = "Cashier Staff", Role = "Cashier" }
        );

        db.SaveChanges();
    }
}
