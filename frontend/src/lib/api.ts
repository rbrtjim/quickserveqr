const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5139";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers }, ...options,
  });
  if (!res.ok) { const text = await res.text(); throw new Error(text || res.statusText); }
  if (res.status === 204) return {} as T;
  return res.json();
}

export const getCategories = () => fetchApi<any[]>("/api/menu/categories");
export const getMenuItems = () => fetchApi<any[]>("/api/menu/items");
export const createMenuItem = (data: any) => fetchApi("/api/menu/items", { method: "POST", body: JSON.stringify(data) });
export const updateMenuItem = (id: string, data: any) => fetchApi(`/api/menu/items/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMenuItem = (id: string) => fetchApi(`/api/menu/items/${id}`, { method: "DELETE" });
export const createCategory = (data: any) => fetchApi("/api/menu/categories", { method: "POST", body: JSON.stringify(data) });

export const getTables = () => fetchApi<any[]>("/api/tables");
export const getTableByQr = (qr: string) => fetchApi<any>(`/api/tables/qr/${qr}`);

export const getOrders = (status?: string) => fetchApi<any[]>(`/api/orders${status ? `?status=${status}` : ""}`);
export const getOrder = (id: string) => fetchApi<any>(`/api/orders/${id}`);
export const getOrdersByTable = (tableId: string) => fetchApi<any[]>(`/api/orders/table/${tableId}`);
export const createOrder = (data: any) => fetchApi<any>("/api/orders", { method: "POST", body: JSON.stringify(data) });
export const updateOrderStatus = (id: string, status: string) => fetchApi(`/api/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
export const updatePayment = (id: string, paymentStatus: string, paymentMethod: string) => fetchApi(`/api/orders/${id}/payment`, { method: "PUT", body: JSON.stringify({ paymentStatus, paymentMethod }) });

export const getDashboardAnalytics = () => fetchApi<any>("/api/analytics/dashboard");
export const login = (email: string, password: string) => fetchApi<any>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

// Image Upload
export const uploadMenuItemImage = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/menu/items/${id}/image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

export const deleteMenuItemImage = (id: string) =>
  fetchApi(`/api/menu/items/${id}/image`, { method: "DELETE" });

export const register = (email: string, password: string, fullName: string, role: string) =>
  fetchApi<any>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, role }),
  });