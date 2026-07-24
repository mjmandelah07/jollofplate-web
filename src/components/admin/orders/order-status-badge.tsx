import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant={status === "PENDING" ? "secondary" : "outline"}
      className={cn(
        status === "PAID" && "bg-accent text-accent-foreground",
        status === "CANCELLED" && "text-destructive",
        status === "PENDING" && "bg-secondary text-secondary-foreground",
      )}
    >
      {status === "PENDING"
        ? "Pending"
        : status === "PAID"
          ? "Paid"
          : "Cancelled"}
    </Badge>
  );
}
