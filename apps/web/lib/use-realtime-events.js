"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { apiClient } from "@/lib/api-client";

export function useRealtimeEvents(role) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

  const socketUrl = useMemo(() => apiClient.getSocketUrl(), []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const initial = await apiClient.getFundingEvents();
        if (active) {
          setEvents(initial.data || []);
        }
      } catch (_error) {
        if (active) {
          setEvents([]);
        }
      }
    };

    bootstrap();

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      setConnected(true);
      if (role) {
        socket.emit("join:role", role);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    const pushEvent = (payload) => {
      setEvents((prev) => [payload, ...prev].slice(0, 30));
    };

    socket.on("contract:event", pushEvent);
    socket.on("contract:event:lender", pushEvent);
    socket.on("contract:event:regulator", pushEvent);

    return () => {
      active = false;
      socket.off("contract:event", pushEvent);
      socket.off("contract:event:lender", pushEvent);
      socket.off("contract:event:regulator", pushEvent);
      socket.disconnect();
    };
  }, [role, socketUrl]);

  return {
    events,
    connected
  };
}
