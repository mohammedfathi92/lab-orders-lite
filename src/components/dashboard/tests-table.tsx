"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, TestTube, CheckCircle2, XCircle, Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "./empty-state";
import { Badge } from "@/components/ui/badge";

interface Test {
  id: string;
  code: string;
  name: string;
  price: number;
  turnaroundDays: number;
  isAvailable: boolean;
}

export function TestsTable() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/tests");

        if (!response.ok) {
          throw new Error("Failed to fetch tests");
        }

        const data = await response.json();
        setTests(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Turnaround</TableHead>
                <TableHead>Status</TableHead>
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
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
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
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild className="shadow-sm">
          <Link href="/dashboard/tests/new">
            <Plus className="mr-2 h-4 w-4" />
            New Test
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Turnaround</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={TestTube}
                    title="No tests found"
                    description="Create your first laboratory test to get started."
                    action={{
                      label: "Create Test",
                      href: "/dashboard/tests/new",
                    }}
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow
                  key={test.id}
                  className="transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell className="font-mono text-sm">{test.code}</TableCell>
                  <TableCell className="font-medium">{test.name}</TableCell>
                  <TableCell>{formatCurrency(test.price)}</TableCell>
                  <TableCell>
                    {test.turnaroundDays} day{test.turnaroundDays !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={test.isAvailable ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {test.isAvailable ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Unavailable
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/tests/${test.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/tests/${test.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
