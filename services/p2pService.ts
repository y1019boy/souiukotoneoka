import { P2P_HISTORY_URL, P2P_WS_URL } from '../constants';
import { P2PQuakeEvent } from '../types';

export const fetchQuakeHistory = async (): Promise<P2PQuakeEvent[]> => {
  try {
    const response = await fetch(P2P_HISTORY_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.statusText}`);
    }
    const data: P2PQuakeEvent[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching quake history:", error);
    return [];
  }
};

type QuakeCallback = (event: P2PQuakeEvent) => void;

export const connectP2PWebSocket = (
  onEvent: QuakeCallback,
  onStatusChange: (connected: boolean) => void
): (() => void) => {
  let ws: WebSocket | null = null;
  let reconnectInterval: ReturnType<typeof setTimeout> | null = null;
  let isClosedIntentionally = false;

  const connect = () => {
    ws = new WebSocket(P2P_WS_URL);

    ws.onopen = () => {
      console.log('Connected to P2PQuake WS');
      onStatusChange(true);
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
        reconnectInterval = null;
      }
    };

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        // Code 551 is standard earthquake info
        // Code 552 is Tsunami info (not handled in detail here, but could be)
        if (data.code === 551) {
          onEvent(data as P2PQuakeEvent);
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from P2PQuake WS');
      onStatusChange(false);
      if (!isClosedIntentionally) {
        console.log('Reconnecting in 5 seconds...');
        reconnectInterval = setTimeout(connect, 5000);
      }
    };

    ws.onerror = (err) => {
      console.error('WS Error', err);
      // onerror will usually be followed by onclose
    };
  };

  connect();

  return () => {
    isClosedIntentionally = true;
    if (ws) {
      ws.close();
    }
    if (reconnectInterval) {
      clearTimeout(reconnectInterval);
    }
  };
};