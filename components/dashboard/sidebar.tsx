"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  BarChart3,
  ClipboardList,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Smartphone,
  Truck,
  Bell,
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Órdenes de Trabajo",
    href: "/dashboard/ordenes",
    icon: ClipboardList,
  },
  {
    title: "Inventario",
    href: "/dashboard/inventario",
    icon: Package,
  },
  {
    title: "Punto de Venta",
    href: "/dashboard/ventas",
    icon: ShoppingCart,
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Empleados",
    href: "/dashboard/empleados",
    icon: Users,
  },
  {
    title: "Proveedores",
    href: "/dashboard/proveedores",
    icon: Truck,
  },
  {
    title: "Notificaciones",
    href: "/dashboard/notificaciones",
    icon: Bell,
  },
  {
    title: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen, isMobile } = useSidebar()

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4 z-40 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0">
            <SidebarContent pathname={pathname} />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div className={cn("h-screen border-r bg-background transition-all duration-300", isOpen ? "w-64" : "w-16")}>
      <SidebarContent pathname={pathname} isCollapsed={!isOpen} />
    </div>
  )
}

function SidebarContent({
  pathname,
  isCollapsed = false,
}: {
  pathname: string
  isCollapsed?: boolean
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Smartphone className="h-6 w-6 text-primary" />
          {!isCollapsed && <span className="text-lg font-bold">Eco_Tech</span>}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                isCollapsed && "justify-center px-0",
              )}
            >
              <link.icon className="h-5 w-5" />
              {!isCollapsed && <span>{link.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-2">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-muted-foreground", isCollapsed && "justify-center px-0")}
        >
          <LogOut className="mr-2 h-5 w-5" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  )
}

