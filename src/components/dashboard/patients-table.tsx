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
import { Plus, Users, Search, Pencil, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { EmptyState } from "./empty-state";
import { Pagination } from "@/components/ui/pagination";
import { usePatients } from "@/hooks/use-patients";

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string | null;
  gender: string;
  address: string | null;
}

export function PatientsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
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

  // Update URL when search or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (page > 1) params.set("page", page.toString());

    router.push(`/dashboard/patients?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, page, router]);

  const { data, isLoading, error } = usePatients({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatContact = (phone: string | null, address: string | null) => {
    const parts = [];
    if (phone) parts.push(phone);
    if (address) parts.push(address);
    return parts.length > 0 ? parts.join(" • ") : "N/A";
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/dashboard/patients?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-10"
                disabled
                value=""
              />
            </div>
          </div>
          <Button asChild className="shadow-sm" disabled>
            <Link href="/dashboard/patients/new">
              <Plus className="mr-2 h-4 w-4" />
              New Patient
            </Link>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Contact</TableHead>
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
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
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

  const patients = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={search ?? ""}
              onChange={(e) => {
                setSearch(e.target.value);
                // Reset to page 1 when searching
                if (page > 1) {
                  const params = new URLSearchParams();
                  params.set("search", e.target.value);
                  router.push(`/dashboard/patients?${params.toString()}`);
                }
              }}
            />
          </div>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/dashboard/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No patients found"
                    description={
                      debouncedSearch
                        ? `No patients match "${debouncedSearch}"`
                        : "Get started by creating your first patient record."
                    }
                    action={
                      !debouncedSearch
                        ? {
                            label: "Create Patient",
                            href: "/dashboard/patients/new",
                          }
                        : undefined
                    }
                    className="border-0"
                  />
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{formatDate(patient.dob)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatContact(patient.phone, patient.address)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/patients/${patient.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/patients/${patient.id}/edit`}>
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