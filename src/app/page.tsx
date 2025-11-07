import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Welcome to
            </h1>
            <h2 className="text-6xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-7xl">
              Lab Orders Lite
            </h2>
          </div>
          
          <p className="max-w-2xl text-xl leading-8 text-gray-600 dark:text-gray-300">
            Streamline your laboratory order management with our comprehensive solution.
            Manage patients, tests, and orders all in one place.
          </p>

          <div className="mt-8">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                Show Account
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
