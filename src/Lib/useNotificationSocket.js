import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";

const getWebSocketURL = () => {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }
  if (typeof window !== "undefined") {
    const loc = window.location;
    // In local CRA dev (localhost:3000), backend runs on 8082
    if (loc.hostname === "localhost" && loc.port === "3000") {
      return "ws://localhost:8082/ws";
    }
    const protocol = loc.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${loc.host}/ws`;
  }
  return "ws://localhost:8082/ws";
};

/**
 * Custom hook for real-time WebSocket notifications via STOMP.
 * Automatically connects when userId is present, subscribes to private queues,
 * and cleans up on unmount.
 */
export default function useNotificationSocket(userId, onNotificationReceived) {
  const onNotificationRef = useRef(onNotificationReceived);

  useEffect(() => {
    onNotificationRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

  useEffect(() => {
    if (!userId) return;

    const wsUrl = getWebSocketURL();

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        // Uncomment for troubleshooting:
        // console.log("[STOMP Debug]:", str);
      },
      onConnect: () => {
        console.log("[STOMP] Connected to notification stream for user:", userId);

        // 1. Private User Queue: /user/queue/notifications
        client.subscribe("/user/queue/notifications", (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("[STOMP] Live notification received via user queue:", data);
            if (onNotificationRef.current) {
              onNotificationRef.current(data);
            }
          } catch (err) {
            console.error("Error parsing websocket notification:", err);
          }
        });

        // 2. User Topic Fallback: /topic/notifications.{userId}
        client.subscribe(`/topic/notifications.${userId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("[STOMP] Live notification received via topic:", data);
            if (onNotificationRef.current) {
              onNotificationRef.current(data);
            }
          } catch (err) {
            console.error("Error parsing topic notification:", err);
          }
        });
      },
      onStompError: (frame) => {
        console.warn("[STOMP] Protocol error:", frame.headers["message"]);
      },
      onWebSocketError: (err) => {
        console.warn("[STOMP] WebSocket transport error:", err);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userId]);
}
