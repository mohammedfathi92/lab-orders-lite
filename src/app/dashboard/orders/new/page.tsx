"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "@/components/ui/toaster";
import { useCreateOrder } from "@/hooks/use-orders";

interface Patient {
  id: string;
  name: string;
}

interface Test {
  id: string;
  name: string;
  price: number;
  turnaroundDays: number;
  isAvailable: boolean;
}

export default function NewOrderPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, testsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/tests"),
        ]);

        if (!patientsRes.ok || !testsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [patientsData, testsData] = await Promise.all([
          patientsRes.json(),
          testsRes.json(),
        ]);

        setPatients(patientsData.data || []);
        setTests((testsData.data || []).filter((test: Test) => test.isAvailable));
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTestToggle = (testId: string) => {
    setSelectedTestIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const calculateTotalCost = (): number => {
    return Array.from(selectedTestIds).reduce((total, testId) => {
      const test = tests.find((t) => t.id === testId);
      return total + (test?.price || 0);
    }, 0);
  };

  const calculateReadyDate = (): Date | null => {
    if (selectedTestIds.size === 0) return null;

    const selectedTests = Array.from(selectedTestIds)
      .map((testId) => tests.find((t) => t.id === testId))
      .filter((test): test is Test => test !== undefined);

    if (selectedTests.length === 0) return null;

    const maxTurnaroundDays = Math.max(...selectedTests.map((test) => test.turnaroundDays));
    const readyDate = new Date();
    readyDate.setDate(readyDate.getDate() + maxTurnaroundDays);
    return readyDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatientId) {
      setError("Please select a patient");
      return;
    }

    if (selectedTestIds.size === 0) {
      setError("Please select at least one test");
      return;
    }

    try {
      setError(null);

      await createOrder.mutateAsync({
        patientId: selectedPatientId,
        testIds: Array.from(selectedTestIds),
      });

      toast.success("Order created successfully", "The order has been created and is ready for processing.");
      router.push("/dashboard/orders");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create order";
      setError(errorMessage);
      toast.error("Failed to create order", errorMessage);
    }
  };

  const totalCost = calculateTotalCost();
  const readyDate = calculateReadyDate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
          <p className="text-muted-foreground">
            Select a patient and tests to create a new laboratory order.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Select patient and tests for this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tests *</Label>
                <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-3">
                  {tests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No available tests</p>
                  ) : (
                    tests.map((test) => (
                      <div
                        key={test.id}
                        className={`flex items-start space-x-3 p-2 rounded-md transition-colors ${
                          selectedTestIds.has(test.id)
                            ? "bg-primary/5 border border-primary/20"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          id={test.id}
                          checked={selectedTestIds.has(test.id)}
                          onCheckedChange={() => handleTestToggle(test.id)}
                        />
                        <div className="flex-1 space-y-1">
                          <Label
                            htmlFor={test.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {test.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            ${test.price.toFixed(2)} • {test.turnaroundDays} day{test.turnaroundDays !== 1 ? "s" : ""} turnaround
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review order details and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Tests:</span>
                  <span className="font-medium">{selectedTestIds.size}</span>
                </div>
                {selectedTestIds.size > 0 && (
                  <div className="space-y-1 mt-2">
                    {Array.from(selectedTestIds).map((testId) => {
                      const test = tests.find((t) => t.id === testId);
                      if (!test) return null;
                      return (
                        <div key={testId} className="flex justify-between text-xs text-muted-foreground">
                          <span>{test.name}</span>
                          <span>${test.price.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost:</span>
                  <span className="text-primary transition-all duration-300">
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              {readyDate && (
                <div className="border-t pt-4 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Ready Date:</span>
                    <span className="font-medium text-primary">
                      {format(readyDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/dashboard/orders">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createOrder.isPending} className="flex-1">
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
