const { Server } = require("socket.io");
const Chat = require("./models/Chat");
const mongoose = require("mongoose");

module.exports = function (server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3001",
        "https://apis.gsbpathy.com",
        "https://main.d13yqss2i4o49v.amplifyapp.com",
        "https://admin.gsbpathy.com",
        "https://74c479b6a8d640b4b7bb7800e74a8fe9-8ef734e1b71d48d881c634dc0.fly.dev",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e8, // 100MB max message size for media
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

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
};
