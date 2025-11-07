import { PatientsTable } from "@/components/dashboard/patients-table";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          Manage patient records and information.
        </p>
      </div>
      <div className="space-y-4">
        <PatientsTable />
      </div>
    </div>
  );
}
