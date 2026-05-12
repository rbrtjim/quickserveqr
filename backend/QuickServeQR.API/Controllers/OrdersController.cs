using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using QuickServeQR.API.Data;
using QuickServeQR.API.DTOs;
using QuickServeQR.API.Hubs;
using QuickServeQR.API.Models;

namespace QuickServeQR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<OrderHub> _hub;

    public OrdersController(AppDbContext db, IHubContext<OrderHub> hub) { _db = db; _hub = hub; }

    [HttpGet]
    public async Task<ActionResult<List<OrderResponseDto>>> GetOrders([FromQuery] string? status = null)
    {
        var query = _db.Orders
            .Include(o => o.Table)
            .Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .OrderByDescending(o => o.CreatedAt)
            .AsQueryable();
        if (!string.IsNullOrEmpty(status)) query = query.Where(o => o.Status == status);
        var orders = await query.ToListAsync();
        return Ok(orders.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(Guid id)
    {
        var order = await _db.Orders.Include(o => o.Table)
            .Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        return Ok(MapToDto(order));
    }

    [HttpGet("table/{tableId}")]
    public async Task<ActionResult<List<OrderResponseDto>>> GetOrdersByTable(Guid tableId)
    {
        var orders = await _db.Orders
            .Where(o => o.TableId == tableId && o.Status != "Completed" && o.Status != "Cancelled")
            .Include(o => o.Table).Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders.Select(MapToDto));
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(CreateOrderDto dto)
    {
        var table = await _db.Tables.FindAsync(dto.TableId);
        if (table == null) return BadRequest("Table not found");

        // Manually generate OrderNumber (SQLite doesn't support auto-increment on non-PK)
        var maxOrderNumber = await _db.Orders.AnyAsync()
            ? await _db.Orders.MaxAsync(o => o.OrderNumber)
            : 0;

        var order = new Order
        {
            TableId = dto.TableId,
            Notes = dto.Notes,
            OrderNumber = maxOrderNumber + 1
        };

        decimal subtotal = 0;

        foreach (var itemDto in dto.Items)
        {
            var menuItem = await _db.MenuItems.FindAsync(itemDto.MenuItemId);
            if (menuItem == null) return BadRequest($"Menu item {itemDto.MenuItemId} not found");
            if (!menuItem.IsAvailable) return BadRequest($"{menuItem.Name} is not available");
            order.Items.Add(new OrderItem
            {
                MenuItemId = itemDto.MenuItemId,
                Quantity = itemDto.Quantity,
                UnitPrice = menuItem.Price,
                SpecialInstructions = itemDto.SpecialInstructions
            });
            subtotal += menuItem.Price * itemDto.Quantity;
        }

        order.Subtotal = subtotal;
        order.Tax = Math.Round(subtotal * 0.10m, 2);
        order.Total = order.Subtotal + order.Tax;
        table.IsOccupied = true;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        var created = await _db.Orders.Include(o => o.Table)
            .Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .FirstAsync(o => o.Id == order.Id);
        var response = MapToDto(created);

        await _hub.Clients.Group("Kitchen").SendAsync("NewOrder", response);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, response);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.Include(o => o.Table).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();

        var valid = new[] { "Pending", "Confirmed", "Preparing", "Ready", "Served", "Completed", "Cancelled" };
        if (!valid.Contains(dto.Status)) return BadRequest("Invalid status");

        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;

        if (dto.Status is "Completed" or "Cancelled")
        {
            var active = await _db.Orders.CountAsync(o =>
                o.TableId == order.TableId && o.Id != order.Id
                && o.Status != "Completed" && o.Status != "Cancelled");
            if (active == 0 && order.Table != null) order.Table.IsOccupied = false;
        }

        await _db.SaveChangesAsync();
        await _hub.Clients.Group($"Table-{order.TableId}").SendAsync("OrderStatusUpdated", new { order.Id, dto.Status });
        await _hub.Clients.Group("Kitchen").SendAsync("OrderStatusUpdated", new { order.Id, dto.Status });
        return NoContent();
    }

    [HttpPut("{id}/payment")]
    public async Task<IActionResult> UpdatePayment(Guid id, UpdatePaymentDto dto)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        order.PaymentStatus = dto.PaymentStatus;
        order.PaymentMethod = dto.PaymentMethod;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    
    private static OrderResponseDto MapToDto(Order o) => new(
        o.Id, o.TableId, o.OrderNumber, o.Table?.TableNumber ?? 0,
            o.Status, o.Subtotal, o.Tax, o.Total, o.Notes,
            o.PaymentStatus, o.PaymentMethod, o.CreatedAt,
            o.Items.Select(i => new OrderItemResponseDto(
                i.Id, i.MenuItemId, i.MenuItem?.Name ?? "", i.Quantity,
                i.UnitPrice, i.SpecialInstructions
            )).ToList()
        );
    }