import * as signalR from "@microsoft/signalr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.191.28.1:5139";

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/orders`, {
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
      console.log("SignalR connected to:", `${API_URL}/hubs/orders`);
    } catch (err) {
      console.error("SignalR connection failed, retrying with long polling:", err);
      // Retry with long polling fallback
      connection = null;
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/orders`)
        .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();
      await connection.start();
      console.log("SignalR connected via long polling");
      return connection;
    }
  }
  return conn;
}

export async function joinKitchen() {
  const conn = await startConnection();
  await conn.invoke("JoinKitchen");
  console.log("Joined Kitchen group");
}

export async function joinTable(tableId: string) {
  const conn = await startConnection();
  await conn.invoke("JoinTable", tableId);
  console.log("Joined Table group:", tableId);
}