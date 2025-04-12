"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useConfiguracion } from "@/app/dashboard/context/configuracion-context"
import Image from "next/image"
import {
  BarChart3,
  ClipboardList,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Truck,
  Bell,
} from "lucide-react"

const allLinks = [
  { title: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["admin", "tecnico", "vendedor"] },
  { title: "Órdenes de Trabajo", href: "/dashboard/ordenes", icon: ClipboardList, roles: ["admin", "tecnico"] },
  { title: "Inventario", href: "/dashboard/inventario", icon: Package, roles: ["admin"] },
  { title: "Punto de Venta", href: "/dashboard/ventas", icon: ShoppingCart, roles: ["admin", "vendedor"] },
  { title: "Clientes", href: "/dashboard/clientes", icon: Users, roles: ["admin", "vendedor"] },
  { title: "Empleados", href: "/dashboard/empleados", icon: Users, roles: ["admin"] },
  { title: "Proveedores", href: "/dashboard/proveedores", icon: Truck, roles: ["admin"] },
  { title: "Notificaciones", href: "/dashboard/notificaciones", icon: Bell, roles: ["admin", "tecnico", "vendedor"] },
  { title: "Configuración", href: "/dashboard/configuracion", icon: Settings, roles: ["admin"] },
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

function SidebarContent({ pathname, isCollapsed = false }: { pathname: string; isCollapsed?: boolean }) {
  const router = useRouter()
  const configuracion = useConfiguracion()

  // ✅ Asegura que no explote si configuracion es undefined
  const logo = configuracion?.logo || ""
  const nombre_empresa = configuracion?.nombre_empresa || ""

  const [rolUsuario, setRolUsuario] = useState<string | null>(null)

  useEffect(() => {
    const fetchRol = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle()

      if (perfil?.rol) setRolUsuario(perfil.rol)
    }

    fetchRol()
  }, [])

  const linksVisibles = rolUsuario ? allLinks.filter((l) => l.roles.includes(rolUsuario)) : []

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          {logo ? (
            <Image src={logo} alt="Logo" width={32} height={32} className="rounded-md object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-md bg-muted" />
          )}
          {!isCollapsed && (
            <span className="text-lg font-bold truncate max-w-[140px]">
              {nombre_empresa}
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {linksVisibles.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                isCollapsed && "justify-center px-0"
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
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/auth/login")
          }}
        >
          <LogOut className="mr-2 h-5 w-5" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  )
}
