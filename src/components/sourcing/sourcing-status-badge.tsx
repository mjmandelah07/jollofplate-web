import { Badge } from "@/components/ui/badge";
import type { SourcingRequestStatus } from "@/types/sourcing";
import { cn } from "@/lib/utils";

export function SourcingStatusBadge({
  status,
}: {
  status: SourcingRequestStatus;
}) {
  return (
    <Badge
      variant={status === "PENDING" ? "secondary" : "outline"}
      className={cn(
        status === "COMPLETED" && "bg-accent text-accent-foreground",
        status === "CANCELLED" && "text-destructive",
        status === "PENDING" && "bg-secondary text-secondary-foreground",
      )}
    >
      {status === "PENDING"
        ? "Pending"
        : status === "COMPLETED"
          ? "Completed"
          : "Cancelled"}
    </Badge>
  );
}
