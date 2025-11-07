"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, DollarSign, User, TestTube, FileText, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "@/components/ui/toaster";
import { useUpdateOrder } from "@/hooks/use-orders";

type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

interface OrderWithDetails {
  id: string;
  patientId: string;
  totalCost: number;
  readyDate: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
    dob: string;
    gender: string;
    phone: string | null;
    address: string | null;
  };
  orderTests: Array<{
    id: string;
    testId: string;
    test: {
      id: string;
      code: string;
      name: string;
      price: number;
      turnaroundDays: number;
    };
  }>;
}

export default function OrderViewPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const updateOrder = useUpdateOrder();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch order");
        }
        const result = await response.json();
        setOrder(result.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load order";
        setError(errorMessage);
        toast.error("Failed to load order", errorMessage);
        router.push("/dashboard/orders");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "outline" as const;
      case "PROCESSING":
        return "secondary" as const;
      case "COMPLETED":
        return "default" as const;
      case "CANCELLED":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatDateOfBirth = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = (newStatusValue: OrderStatus) => {
    if (!order) return;

    // Don't show confirmation if status hasn't actually changed
    if (newStatusValue === order.status) {
      return;
    }

    // Store the new status, set pending status to show in select, and show confirmation dialog
    setNewStatus(newStatusValue);
    setPendingStatus(newStatusValue);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!order || !newStatus) return;

    // Close dialog and set pending status
    setShowConfirmDialog(false);
    setPendingStatus(newStatus);

    try {
      const result = await updateOrder.mutateAsync({
        id: order.id,
        data: { status: newStatus },
      });
      
      setOrder(result.data);
      setPendingStatus(null);
      setNewStatus(null);
      toast.success("Order status updated", `Order status changed to ${newStatus}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update order status";
      setPendingStatus(null);
      setNewStatus(null);
      toast.error("Failed to update status", errorMessage);
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmDialog(false);
    setNewStatus(null);
    setPendingStatus(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground">Order not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Order not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        if (!open) {
          cancelStatusChange();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Status Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change the order status from{" "}
              <span className="font-semibold">{order?.status}</span> to{" "}
              <span className="font-semibold">{newStatus}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelStatusChange}
              disabled={updateOrder.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={updateOrder.isPending}
            >
              {updateOrder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">
            View complete information for order #{order.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm px-3 py-1">
          {order.status}
        </Badge>
        {updateOrder.isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Information
            </CardTitle>
            <CardDescription>Order details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <span className="text-sm font-mono">{order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <Select
                    value={pendingStatus || order.status}
                    onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                    disabled={updateOrder.isPending}
                  >
                    <SelectTrigger className="w-[150px]">
                      {updateOrder.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Cost
                </span>
                <span className="text-lg font-semibold">{formatCurrency(order.totalCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ready Date
                </span>
                <span className="text-sm">{formatDateShort(order.readyDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>Patient details for this order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{order.patient.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date of Birth</span>
                <span className="text-sm">{formatDateOfBirth(order.patient.dob)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gender</span>
                <span className="text-sm">{order.patient.gender}</span>
              </div>
              {order.patient.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm">{order.patient.phone}</span>
                </div>
              )}
              {order.patient.address && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Address</span>
                  <span className="text-sm text-right max-w-[200px]">{order.patient.address}</span>
                </div>
              )}
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/dashboard/patients/${order.patient.id}/edit`}>
                    View Patient
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Tests ({order.orderTests.length})
          </CardTitle>
          <CardDescription>Laboratory tests included in this order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderTests.map((orderTest) => (
              <div
                key={orderTest.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{orderTest.test.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Code: {orderTest.test.code} • Turnaround: {orderTest.test.turnaroundDays} day{orderTest.test.turnaroundDays !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(orderTest.test.price)}</div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold">{formatCurrency(order.totalCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

