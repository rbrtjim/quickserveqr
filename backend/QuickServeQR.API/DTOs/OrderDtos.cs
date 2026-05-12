namespace QuickServeQR.API.DTOs;

public record CreateOrderDto(Guid TableId, string? Notes, List<CreateOrderItemDto> Items);
public record CreateOrderItemDto(Guid MenuItemId, int Quantity, string? SpecialInstructions);
public record UpdateOrderStatusDto(string Status);
public record UpdatePaymentDto(string PaymentStatus, string PaymentMethod);

public record OrderResponseDto(
    Guid Id, Guid TableId, int OrderNumber, int TableNumber, string Status,
    decimal Subtotal, decimal Tax, decimal Total, string? Notes,
    string PaymentStatus, string? PaymentMethod, DateTime CreatedAt,
    List<OrderItemResponseDto> Items
);

public record OrderItemResponseDto(
    Guid Id, Guid MenuItemId, string MenuItemName,
    int Quantity, decimal UnitPrice, string? SpecialInstructions
);