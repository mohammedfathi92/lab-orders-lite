import { OrdersTable } from "@/components/dashboard/orders-table";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          View and manage laboratory orders.
        </p>
      </div>
      <div className="space-y-4">
        <OrdersTable />
      </div>
    </div>
  );
}
