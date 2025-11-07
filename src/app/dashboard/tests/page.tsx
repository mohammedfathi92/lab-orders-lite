import { TestsTable } from "@/components/dashboard/tests-table";

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
        <p className="text-muted-foreground">
          Manage laboratory tests and their configurations.
        </p>
      </div>
      <div className="space-y-4">
        <TestsTable />
      </div>
    </div>
  );
}
