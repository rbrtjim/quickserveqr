using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace QuickServeQR.API.Hubs;

public class OrderHub : Hub
{
    [Authorize(Roles = "Admin,Kitchen,Waiter,Cashier")]
    public async Task JoinKitchen() =>
        await Groups.AddToGroupAsync(Context.ConnectionId, "Kitchen");

    public async Task JoinTable(string tableId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Table-{tableId}");

    public async Task LeaveTable(string tableId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Table-{tableId}");
}
