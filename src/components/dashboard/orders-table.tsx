"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShoppingCart, Search, Filter, X, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EmptyState } from "./empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useOrders } from "@/hooks/use-orders";

// Import Order type from hook
type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export function OrdersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") ?? "");

  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when search, status, or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);
    if (page > 1) params.set("page", page.toString());

    router.push(`/dashboard/orders?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, statusFilter, page, router]);

  const { data, isLoading, error } = useOrders({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setShowFilters(false);
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
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/orders?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name..."
                className="pl-10"
                value=""
                disabled
              />
            </div>
          </div>
          <Button asChild className="shadow-sm" disabled>
            <Link href="/dashboard/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Link>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Ready Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
      </div>
    );
  }

  const orders: Array<{
    id: string;
    patientId: string;
    totalCost: number;
    readyDate: string;
    status: OrderStatus;
    patient?: {
      id: string;
      name: string;
    };
  }> = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name..."
              className="pl-10"
              value={search ?? ""}
              onChange={(e) => {
                setSearch(e.target.value);
                // Reset to page 1 when searching
                if (page > 1) {
                  const params = new URLSearchParams();
                  params.set("search", e.target.value);
                  router.push(`/dashboard/orders?${params.toString()}`);
                }
              }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="shadow-sm"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {(statusFilter) && (
              <Badge variant="secondary" className="ml-2">
                1
              </Badge>
            )}
          </Button>
          <Button asChild className="shadow-sm">
            <Link href="/dashboard/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Link>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={statusFilter || undefined} 
                onValueChange={(value) => setStatusFilter(value || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter("")}
                  className="h-6 px-2 text-xs"
                >
                  Clear status
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Ready Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <EmptyState
                    icon={ShoppingCart}
                    title="No orders found"
                    description={
                      debouncedSearch
                        ? `No orders match "${debouncedSearch}"`
                        : "Create your first laboratory order to get started."
                    }
                    action={
                      !debouncedSearch
                        ? {
                            label: "Create Order",
                            href: "/dashboard/orders/new",
                          }
                        : undefined
                    }
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {order.patient?.name || "Unknown Patient"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalCost)}</TableCell>
                  <TableCell>{formatDate(order.readyDate)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}