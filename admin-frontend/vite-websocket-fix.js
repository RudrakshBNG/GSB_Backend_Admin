// Custom Vite plugin to fix WebSocket connection issues
export function websocketFix() {
  return {
    name: "websocket-fix",
    configureServer(server) {
      server.ws.on("connection", (socket) => {
        socket.on("error", (err) => {
          console.warn("WebSocket error caught and ignored:", err.message);
        });
      });
    },
    handleHotUpdate() {
      // Prevent infinite HMR loops
      return [];
    },
  };
}
