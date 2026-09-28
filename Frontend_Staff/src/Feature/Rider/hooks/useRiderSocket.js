import { useEffect } from "react";
import { staffSocket as riderSocket } from "../../../utils/socket";

export { riderSocket };

export function useRiderSocket({ riderId, queryClient }) {
  useEffect(() => {
    const handleJoin = () => {
      riderSocket.emit("join_room", "rider");
    };

    const invalidateAssigned = (data) => {
      if (queryClient && riderId) {
        // If event targets a specific rider, ignore if it's not us
        if (data?.rider_id && String(data.rider_id) !== String(riderId)) {
          return;
        }
        queryClient.invalidateQueries({
          queryKey: ["rider_assigned_order", riderId],
        });
      }
    };

    if (riderSocket.connected) {
      handleJoin();
    } else {
      riderSocket.on("connect", handleJoin);
    }

    riderSocket.on("refresh_rider", invalidateAssigned);
    riderSocket.on("trigger_rider_assignment", invalidateAssigned);
    riderSocket.on("order_status_updated", invalidateAssigned);

    return () => {
      riderSocket.off("connect", handleJoin);
      riderSocket.off("refresh_rider", invalidateAssigned);
      riderSocket.off("trigger_rider_assignment", invalidateAssigned);
      riderSocket.off("order_status_updated", invalidateAssigned);
    };
  }, [queryClient, riderId]);

  return riderSocket;
}
