"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TestTube, DollarSign, Clock, Edit, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "@/components/ui/toaster";

interface Test {
  id: string;
  code: string;
  name: string;
  price: number;
  turnaroundDays: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TestViewPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/tests/${testId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch test");
        }
        const result = await response.json();
        setTest(result.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load test";
        setError(errorMessage);
        toast.error("Failed to load test", errorMessage);
        router.push("/dashboard/tests");
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId, router]);

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

  if (error || !test) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/tests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Details</h1>
            <p className="text-muted-foreground">Test not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Test not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Test Details</h1>
          <p className="text-muted-foreground">
            View complete information for {test.name}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/tests/${test.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Test
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Information
            </CardTitle>
            <CardDescription>Laboratory test details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Test Name</span>
                <span className="text-sm font-medium">{test.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Test Code</span>
                <Badge variant="outline" className="font-mono">{test.code}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={test.isAvailable ? "default" : "secondary"}>
                  {test.isAvailable ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Available
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Unavailable
                    </div>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Turnaround */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Turnaround
            </CardTitle>
            <CardDescription>Test pricing and processing time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price
                </span>
                <span className="text-lg font-semibold">{formatCurrency(test.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Turnaround Time
                </span>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {test.turnaroundDays} day{test.turnaroundDays !== 1 ? "s" : ""}
                  </span>
                  {test.turnaroundDays === 0 && (
                    <div className="text-xs text-muted-foreground">Same day</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
          <CardDescription>Test record metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Test ID</span>
              <span className="text-sm font-mono">{test.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(test.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm">{formatDate(test.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

