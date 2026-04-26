const registerSocket = (io) => {
  io.on("connection", (socket) => {
    socket.emit("system:connected", {
      message: "Connected to UMKMChain event gateway",
      socketId: socket.id,
      at: new Date().toISOString()
    });

    socket.on("join:role", (role) => {
      if (typeof role === "string" && role.length) {
        socket.join(`role:${role}`);
      }
    });

    socket.on("disconnect", () => {
      // keep this handler for observability hooks and metrics extension.
    });
  });
};

module.exports = registerSocket;
