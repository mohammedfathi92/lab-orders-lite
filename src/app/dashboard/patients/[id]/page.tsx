"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Calendar, Phone, MapPin, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "@/components/ui/toaster";

interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PatientViewPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/patients/${patientId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch patient");
        }
        const result = await response.json();
        setPatient(result.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load patient";
        setError(errorMessage);
        toast.error("Failed to load patient", errorMessage);
        router.push("/dashboard/patients");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId, router]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy 'at' h:mm a");
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

  const calculateAge = (dateString: string) => {
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
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

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/patients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
            <p className="text-muted-foreground">Patient not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || "Patient not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(patient.dob);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
          <p className="text-muted-foreground">
            View complete information for {patient.name}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/patients/${patient.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Patient personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Full Name</span>
                <span className="text-sm font-medium">{patient.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatDateOfBirth(patient.dob)}</div>
                  {age !== null && (
                    <div className="text-xs text-muted-foreground">{age} years old</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gender</span>
                <Badge variant="outline">{patient.gender}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Patient contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {patient.phone ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </span>
                  <span className="text-sm font-medium">{patient.phone}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </span>
                  <span className="text-sm text-muted-foreground">Not provided</span>
                </div>
              )}
              {patient.address ? (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </span>
                  <span className="text-sm text-right max-w-[200px]">{patient.address}</span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </span>
                  <span className="text-sm text-muted-foreground">Not provided</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
          <CardDescription>Patient record metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Patient ID</span>
              <span className="text-sm font-mono">{patient.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(patient.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm">{formatDate(patient.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

