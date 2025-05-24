import { useEffect, useCallback } from "react";
import { socketService } from "@/lib/socket";

export function useWebSocket(event: string, handler: (data: any) => void) {
  const memoizedHandler = useCallback(handler, []);

  useEffect(() => {
    socketService.on(event, memoizedHandler);

    return () => {
      socketService.off(event, memoizedHandler);
    };
  }, [event, memoizedHandler]);
}
