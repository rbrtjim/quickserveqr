import * as signalR from "@microsoft/signalr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5139";

function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("quickserve_user");
  if (!stored) return "";
  try {
    return JSON.parse(stored)?.token ?? "";
  } catch {
    return "";
  }
}

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/orders`, {
        accessTokenFactory: getStoredToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.onreconnecting((error) => {
      console.warn("SignalR reconnecting:", error);
    });

    connection.onreconnected((connectionId) => {
      console.log("SignalR reconnected:", connectionId);
    });

    connection.onclose((error) => {
      console.warn("SignalR closed:", error);
      connection = null;
    });
  }
  return connection;
}

export async function startConnection(): Promise<signalR.HubConnection> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
    } catch (err) {
      console.error("SignalR WebSocket failed, retrying with long polling:", err);
      connection = null;
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/orders`, { accessTokenFactory: getStoredToken })
        .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();
      await connection.start();
      return connection;
    }
  }
  return conn;
}

export async function joinKitchen() {
  const conn = await startConnection();
  await conn.invoke("JoinKitchen");
}

export async function joinTable(tableId: string) {
  const conn = await startConnection();
  await conn.invoke("JoinTable", tableId);
}
