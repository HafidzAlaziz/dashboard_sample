"use client";

import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesDistributionChart } from "@/components/dashboard/SalesDistributionChart";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { useDashboard } from "@/components/dashboard/DashboardContext";

export default function DashboardPage() {
  const { stats, customerStats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Memuat data real-time...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ringkasan Bisnis</h2>
        <p className="text-slate-500 dark:text-slate-400">Selamat datang kembali, berikut laporan performa usaha Anda hari ini.</p>
      </div>

      {/* Top Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`}
          change={`${parseFloat(stats.revenueChange) >= 0 ? '+' : ''}${stats.revenueChange}%`}
          isPositive={parseFloat(stats.revenueChange) >= 0}
          icon={DollarSign}
          subtext="vs bulan lalu"
          delay={0.1}
        />
        <StatCard
          title="Total Penjualan"
          value={stats.totalOrders.toLocaleString('id-ID')}
          change={`${parseFloat(stats.salesChange) >= 0 ? '+' : ''}${stats.salesChange}%`}
          isPositive={parseFloat(stats.salesChange) >= 0}
          icon={ShoppingBag}
          subtext="Pesanan bulan ini"
          delay={0.2}
        />
        <StatCard
          title="Total Pelanggan"
          value={customerStats.totalCustomers.toLocaleString('id-ID')}
          change={`+${customerStats.newCustomers}`}
          isPositive={true}
          icon={Users}
          subtext="pelanggan terdaftar"
          delay={0.3}
        />
        <StatCard
          title="Rata-rata Transaksi"
          value={`Rp ${stats.averageTransaction.toLocaleString('id-ID')}`}
          change="+0%"
          isPositive={true}
          icon={TrendingUp}
          subtext="per pesanan"
          delay={0.4}
        />
      </div>

      {/* Main Charts Area */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="xl:col-span-1">
          <SalesDistributionChart />
        </div>
      </div>

      {/* Orders Table */}
      <div className="grid grid-cols-1 gap-6">
        <OrdersTable />
      </div>
    </DashboardWrapper>
  );
}
