using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickServeQR.API.Data;
using QuickServeQR.API.DTOs;

namespace QuickServeQR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AnalyticsController(AppDbContext db) => _db = db;

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardAnalyticsDto>> GetDashboard()
    {
        var today = DateTime.UtcNow.Date;
        var todayOrders = await _db.Orders
            .Where(o => o.CreatedAt >= today)
            .Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .ToListAsync();

        var totalOrders = todayOrders.Count;
        var totalRevenue = todayOrders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.Total);
        var activeOrders = todayOrders.Count(o => o.Status != "Completed" && o.Status != "Cancelled");
        var avgValue = totalOrders > 0 ? todayOrders.Average(o => o.Total) : 0;
        var tables = await _db.Tables.ToListAsync();

        var topItems = todayOrders.SelectMany(o => o.Items)
            .GroupBy(i => i.MenuItem?.Name ?? "Unknown")
            .Select(g => new TopSellingItemDto(g.Key, g.Sum(i => i.Quantity), g.Sum(i => i.UnitPrice * i.Quantity)))
            .OrderByDescending(x => x.Quantity).Take(5).ToList();

        var byHour = todayOrders.GroupBy(o => o.CreatedAt.Hour)
            .Select(g => new RevenueByHourDto(g.Key, g.Sum(o => o.Total), g.Count()))
            .OrderBy(x => x.Hour).ToList();

        return Ok(new DashboardAnalyticsDto(
            totalOrders, totalRevenue, activeOrders,
            tables.Count(t => t.IsOccupied), tables.Count,
            Math.Round(avgValue, 2), topItems, byHour
        ));
    }
}
