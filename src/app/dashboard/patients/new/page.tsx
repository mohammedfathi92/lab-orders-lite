"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";
import { useCreatePatient } from "@/hooks/use-patients";

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createPatient.mutateAsync({
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone || null,
        address: formData.address || null,
      });

      toast.success("Patient created successfully", "The patient record has been added to the system.");
      router.push("/dashboard/patients");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create patient";
      setErrors({ submit: errorMessage });
      toast.error("Failed to create patient", errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Patient</h1>
          <p className="text-muted-foreground">
            Add a new patient record to the system.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Enter the patient&apos;s details below. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
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

              <div className="space-y-2">
                <Label htmlFor="dob">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className={errors.dob ? "border-destructive" : ""}
                />
                {errors.dob && (
                  <p className="text-sm text-destructive">{errors.dob}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.gender || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger
                    id="gender"
                    className={errors.gender ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.address ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/dashboard/patients">Cancel</Link>
              </Button>
              <Button type="submit" disabled={createPatient.isPending} className="flex-1">
                {createPatient.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Patient"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
