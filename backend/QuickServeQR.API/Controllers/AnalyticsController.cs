using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickServeQR.API.Data;
using QuickServeQR.API.DTOs;

namespace QuickServeQR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AnalyticsController(AppDbContext db) => _db = db;

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardAnalyticsDto>> GetDashboard()
    {
        var today = DateTime.UtcNow.Date;

        var totalOrders = await _db.Orders.CountAsync(o => o.CreatedAt >= today);

        var totalRevenue = await _db.Orders
            .Where(o => o.CreatedAt >= today && o.PaymentStatus == "Paid")
            .SumAsync(o => (decimal?)o.Total) ?? 0;

        var activeOrders = await _db.Orders
            .CountAsync(o => o.CreatedAt >= today
                && o.Status != "Completed" && o.Status != "Cancelled");

        var avgValue = totalOrders > 0
            ? await _db.Orders
                .Where(o => o.CreatedAt >= today)
                .AverageAsync(o => (decimal?)o.Total) ?? 0
            : 0;

        var tables = await _db.Tables
            .Select(t => new { t.IsOccupied })
            .ToListAsync();

        var topItems = await _db.Orders
            .Where(o => o.CreatedAt >= today)
            .SelectMany(o => o.Items)
            .GroupBy(i => i.MenuItem!.Name)
            .Select(g => new TopSellingItemDto(
                g.Key ?? "Unknown",
                g.Sum(i => i.Quantity),
                g.Sum(i => i.UnitPrice * i.Quantity)))
            .OrderByDescending(x => x.Quantity)
            .Take(5)
            .ToListAsync();

        var byHour = await _db.Orders
            .Where(o => o.CreatedAt >= today)
            .GroupBy(o => o.CreatedAt.Hour)
            .Select(g => new RevenueByHourDto(g.Key, g.Sum(o => o.Total), g.Count()))
            .OrderBy(x => x.Hour)
            .ToListAsync();

        return Ok(new DashboardAnalyticsDto(
            totalOrders, totalRevenue, activeOrders,
            tables.Count(t => t.IsOccupied), tables.Count,
            Math.Round(avgValue, 2), topItems, byHour
        ));
    }
}
