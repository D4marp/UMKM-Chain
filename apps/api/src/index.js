const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const env = require("./config/env");
const registerSocket = require("./socket/register-socket");
const eventBridge = require("./services/event-bridge.service");
const {
  startContractEventBridge,
  stopContractEventBridge
} = require("./services/contract-event-listener.service");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.corsOrigin,
    methods: ["GET", "POST"]
  }
});

eventBridge.attachSocketIO(io);
registerSocket(io);

server.listen(env.port, () => {
  console.log(`UMKMChain API listening on http://localhost:${env.port}`);
  startContractEventBridge().catch((error) => {
    console.error("Unable to start contract event bridge:", error.message);
  });
});

const shutdown = () => {
  stopContractEventBridge();
  io.close();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
