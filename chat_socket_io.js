const { Server } = require("socket.io");
const Chat = require("./models/Chat");
const mongoose = require("mongoose");

module.exports = function (server) {
  console.log("🚀 Initializing Socket.IO server...");

  try {
    const io = new Server(server, {
      cors: {
        origin: function (origin, callback) {
          const allowedOrigins = [
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:3001",
            "https://apis.gsbpathy.com",
            "https://main.d13yqss2i4o49v.amplifyapp.com",
            "https://admin.gsbpathy.com",
            "https://74c479b6a8d640b4b7bb7800e74a8fe9-8ef734e1b71d48d881c634dc0.fly.dev",
          ];

          console.log("Socket.IO connection origin:", origin);

          // Allow requests with no origin (mobile apps, curl, etc.)
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.log("Socket.IO CORS blocked origin:", origin);
            callback(null, false);
          }
        },
        methods: ["GET", "POST"],
        credentials: true,
      },
      maxHttpBufferSize: 1e8, // 100MB max message size for media
      transports: ["polling", "websocket"],
      pingTimeout: 60000,
      pingInterval: 25000,
      allowEIO3: true, // Allow Engine.IO v3 clients
    });

    // Authentication middleware temporarily disabled for debugging
    /* io.use((socket, next) => {
      try {
        console.log("🔐 Socket.IO middleware - authentication check");
        console.log("Handshake:", {
          headers: socket.handshake.headers,
          query: socket.handshake.query,
          auth: socket.handshake.auth,
        });

        const auth = socket.handshake.auth;
        console.log("Socket authentication data:", auth);

        // Allow connection even without strict auth for admin panel
        if (auth && (auth.userId || auth.email)) {
          socket.userId = auth.userId;
          socket.userEmail = auth.email;
          console.log(
            `✅ Socket authenticated: ${auth.userId} (${auth.email})`,
          );
        } else {
          // Allow anonymous connections for admin panel
          socket.userId = "anonymous";
          socket.userEmail = "anonymous@admin";
          console.log("⚠️ Anonymous socket connection allowed");
        }

        console.log("🔐 Authentication middleware completed successfully");
        next();
      } catch (err) {
        console.error("❌ Socket authentication error:", err);
        console.error("Error stack:", err.stack);
        next(new Error(`Authentication failed: ${err.message}`));
      }
    }); */

    io.on("connection", (socket) => {
      try {
        console.log(
          `✅ New client connected: ${socket.id} (User: ${socket.userId})`,
        );

        // Send a welcome message to confirm connection
        socket.emit("welcome", {
          message: "Connected to GSB Admin Chat Server",
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("❌ Error in connection handler:", err);
        socket.emit("error", { message: "Connection handler error" });
      }

      socket.on("error", (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);
      });

      socket.on("joinChat", ({ chatId, userType, userId }) => {
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
          socket.emit("error", { message: "Invalid chat ID" });
          return;
        }
        socket.join(chatId);
        console.log(`${userType} ${userId} joined chat ${chatId}`);
      });

      socket.on("sendMessage", async ({ chatId, sender, text, media }) => {
        try {
          if (!mongoose.Types.ObjectId.isValid(chatId)) {
            socket.emit("error", { message: "Invalid chat ID" });
            return;
          }

          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
          }

          const message = {
            sender,
            text: text || "",
            timestamp: new Date(),
          };

          if (media) {
            message.media = {
              type: media.type, // 'image', 'video', 'pdf'
              url: media.url,
              fileName: media.fileName,
              fileSize: media.fileSize,
            };
          }

          chat.messages.push(message);
          await chat.save();

          io.to(chatId).emit("newMessage", {
            chatId,
            message,
          });
        } catch (error) {
          socket.emit("error", {
            message: "Failed to send message",
            error: error.message,
          });
        }
      });

      socket.on("typing", ({ chatId, userType, userId }) => {
        socket.to(chatId).emit("userTyping", { userType, userId });
      });

      socket.on("stopTyping", ({ chatId, userType, userId }) => {
        socket.to(chatId).emit("userStoppedTyping", { userType, userId });
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    return io;
  } catch (err) {
    console.error("❌ Error initializing Socket.IO server:", err);
    throw err;
  }
};
