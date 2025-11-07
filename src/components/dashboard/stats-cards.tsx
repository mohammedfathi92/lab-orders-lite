"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TestTube, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface StatsData {
  patients: number;
  tests: number;
  orders: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all three endpoints in parallel
        const [patientsRes, testsRes, ordersRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/tests"),
          fetch("/api/orders"),
        ]);

        if (!patientsRes.ok || !testsRes.ok || !ordersRes.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const [patientsData, testsData, ordersData] = await Promise.all([
          patientsRes.json(),
          testsRes.json(),
          ordersRes.json(),
        ]);

        // Extract counts from API responses
        // Patients and Orders have pagination.total, Tests is just an array
        const patientsCount = patientsData.pagination?.total ?? patientsData.data?.length ?? 0;
        const testsCount = testsData.data?.length ?? 0;
        const ordersCount = ordersData.pagination?.total ?? ordersData.data?.length ?? 0;

        setStats({
          patients: patientsCount,
          tests: testsCount,
          orders: ordersCount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats?.patients ?? 0,
      icon: Users,
      description: "Registered patients",
      color: "text-blue-600",
      hoverColor: "hover:border-blue-500",
      href: "/dashboard/patients",
    },
    {
      title: "Total Tests",
      value: stats?.tests ?? 0,
      icon: TestTube,
      description: "Available tests",
      color: "text-green-600",
      hoverColor: "hover:border-green-500",
      href: "/dashboard/tests",
    },
    {
      title: "Total Orders",
      value: stats?.orders ?? 0,
      icon: ShoppingCart,
      description: "Lab orders",
      color: "text-purple-600",
      hoverColor: "hover:border-purple-500",
      href: "/dashboard/orders",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.title} href={stat.href} className="block">
            <Card
              className={`group transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${stat.hoverColor} border-2 animate-in fade-in slide-in-from-bottom-4 cursor-pointer`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold transition-all duration-500 ease-in-out">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
