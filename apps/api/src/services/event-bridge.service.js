const { EventEmitter } = require("events");
const { randomUUID } = require("crypto");
const { addEvent } = require("../data/store");

class EventBridgeService extends EventEmitter {
  constructor() {
    super();
    this.io = null;
  }

  attachSocketIO(io) {
    this.io = io;
  }

  publish(contractEvent, payload, meta = {}) {
    const eventPacket = {
      id: randomUUID(),
      contractEvent,
      payload,
      createdAt: new Date().toISOString(),
      source: meta.source || "app",
      transactionHash: meta.transactionHash || null,
      blockNumber: meta.blockNumber || null
    };

    addEvent(eventPacket);

    if (this.io) {
      this.io.emit("contract:event", eventPacket);
      this.io.to("role:LENDER").emit("contract:event:lender", eventPacket);
      this.io.to("role:REGULATOR").emit("contract:event:regulator", eventPacket);
    }

    this.emit(contractEvent, eventPacket);
    this.emit("event", eventPacket);
    return eventPacket;
  }
}

module.exports = new EventBridgeService();
