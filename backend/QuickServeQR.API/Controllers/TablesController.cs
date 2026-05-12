using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuickServeQR.API.Data;
using QuickServeQR.API.Models;

namespace QuickServeQR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly AppDbContext _db;
    public TablesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RestaurantTable>>> GetTables() =>
        Ok(await _db.Tables.OrderBy(t => t.TableNumber).ToListAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<RestaurantTable>> GetTable(Guid id)
    {
        var table = await _db.Tables.FindAsync(id);
        return table == null ? NotFound() : Ok(table);
    }

    [HttpGet("qr/{qrCode}")]
    public async Task<ActionResult<RestaurantTable>> GetTableByQr(string qrCode)
    {
        var table = await _db.Tables.FirstOrDefaultAsync(t => t.QrCode == qrCode);
        return table == null ? NotFound() : Ok(table);
    }
}
