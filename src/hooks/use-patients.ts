import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string | null;
  gender: string;
  address: string | null;
}

interface PatientsResponse {
  success: boolean;
  data: Patient[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface PatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  gender?: string;
  phone?: string;
}

export function usePatients(params: PatientsParams = {}) {
  return useQuery<PatientsResponse>({
    queryKey: ["patients", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.search) searchParams.set("search", params.search);
      if (params.name) searchParams.set("name", params.name);
      if (params.gender) searchParams.set("gender", params.gender);
      if (params.phone) searchParams.set("phone", params.phone);

      const response = await fetch(`/api/patients?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    },
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      dob: string;
      gender: string;
      phone?: string | null;
      address?: string | null;
    }) => {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create patient");
      }
      return response.json();
    },
    onMutate: async (newPatient) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["patients"] });

      // Snapshot previous value
      const previousPatients = queryClient.getQueryData<PatientsResponse>(["patients"]);

      // Optimistically update
      if (previousPatients) {
        queryClient.setQueryData<PatientsResponse>(["patients"], {
          ...previousPatients,
          data: [
            {
              id: `temp-${Date.now()}`,
              ...newPatient,
              dob: newPatient.dob,
              phone: newPatient.phone ?? null,
              address: newPatient.address ?? null,
            },
            ...previousPatients.data,
          ],
          pagination: {
            ...previousPatients.pagination,
            total: previousPatients.pagination.total + 1,
          },
        });
      }

      return { previousPatients };
    },
    onError: (err, newPatient, context) => {
      // Rollback on error
      if (context?.previousPatients) {
        queryClient.setQueryData(["patients"], context.previousPatients);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        dob?: string;
        gender?: string;
        phone?: string | null;
        address?: string | null;
      };
    }) => {
      const response = await fetch(`/api/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update patient");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all patient queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}