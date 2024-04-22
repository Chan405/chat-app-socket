const { Server } = require("socket.io");
const io = new Server({ cors: "http://localhost:3000" });

let onlineUsers = [];
io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  // listen to a new connection
  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });

    io.emit("getOnlineUsers", onlineUsers);
  });

  // sendMessage
  socket.on("sendMessage", (response) => {
    console.log("send message => ", response);
    const user = onlineUsers.find((user) => user.userId === response.partnerId);
    if (user) {
      io.to(user.socketId).emit("getMessage", response);
      io.to(user.socketId).emit("getNotification", {
        sendId: response.data.sendId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  // disconect user
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });

  console.log("online users =>", onlineUsers);
});

io.listen(3001);
