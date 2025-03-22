import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { InventoryStatus } from "@/components/dashboard/inventory-status"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <DashboardCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrders />
        <InventoryStatus />
      </div>
    </div>
  )
}

