"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";

export default function NewTestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    price: "",
    turnaroundDays: "",
    isAvailable: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) {
      newErrors.code = "Code is required";
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = "Code must contain only uppercase letters, numbers, hyphens, and underscores";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.turnaroundDays || parseInt(formData.turnaroundDays) < 0) {
      newErrors.turnaroundDays = "Turnaround days must be 0 or greater";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          name: formData.name,
          price: parseFloat(formData.price),
          turnaroundDays: parseInt(formData.turnaroundDays),
          isAvailable: formData.isAvailable,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create test");
      }

      toast.success("Test created successfully", "The test has been added to the system.");
      router.push("/dashboard/tests");
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create test";
      setErrors({ submit: errorMessage });
      toast.error("Failed to create test", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
          <p className="text-muted-foreground">
            Add a new laboratory test to the system.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>
              Enter the test details below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Test Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="e.g., CBC, LFT"
                  value={formData.code ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className={errors.code ? "border-destructive" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-destructive">{errors.code}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="name">
                  Test Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Complete Blood Count"
                  value={formData.name ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (USD) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className={errors.price ? "border-destructive" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="turnaroundDays">
                  Turnaround Days <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="turnaroundDays"
                  type="number"
                  min="0"
                  placeholder="1"
                  value={formData.turnaroundDays ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, turnaroundDays: e.target.value })
                  }
                  className={errors.turnaroundDays ? "border-destructive" : ""}
                />
                {errors.turnaroundDays && (
                  <p className="text-sm text-destructive">
                    {errors.turnaroundDays}
                  </p>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/dashboard/tests">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Test"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
