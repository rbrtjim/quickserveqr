namespace QuickServeQR.API.DTOs;

public record DashboardAnalyticsDto(
    int TotalOrders, decimal TotalRevenue, int ActiveOrders,
    int TablesOccupied, int TotalTables, decimal AverageOrderValue,
    List<TopSellingItemDto> TopSellingItems,
    List<RevenueByHourDto> RevenueByHour
);

public record TopSellingItemDto(string Name, int Quantity, decimal Revenue);
public record RevenueByHourDto(int Hour, decimal Revenue, int OrderCount);
