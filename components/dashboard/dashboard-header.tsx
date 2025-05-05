"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useSidebar } from "./sidebar-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Menu, Search, User, Moon, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { supabase } from "@/lib/supabase"

export function DashboardHeader() {
  const { setIsOpen } = useSidebar()
  const [searchQuery, setSearchQuery] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || "")
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchNotificaciones = async () => {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", userId)
        .order("fecha_creacion", { ascending: false })
        .limit(5)

      if (!error) {
        setNotificaciones(data || [])
      }
    }

    fetchNotificaciones()

    const channel = supabase
      .channel("realtime-notificaciones-header")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificaciones",
          filter: `usuario_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotificaciones((prev) => [payload.new, ...prev.slice(0, 4)])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  if (!mounted) return null

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
        <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative hidden md:block md:w-64 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Cambiar tema</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {noLeidas > 0 && (
                <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {noLeidas}
                </span>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="text-sm font-semibold mb-2">Notificaciones</div>
            {notificaciones.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay notificaciones</p>
            ) : (
              <ul className="space-y-2">
                {notificaciones.map((n) => (
                  <li key={n.id} className="border-b pb-1 text-sm">
                    <div className="font-medium">{n.titulo}</div>
                    <p className="text-muted-foreground">{n.mensaje}</p>
                    <span className="text-xs text-gray-400 block">{new Date(n.fecha_creacion).toLocaleString()}</span>
                    {n.enlace && (
                      <a href={n.enlace} className="text-primary text-xs hover:underline">
                        Ver detalles
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Perfil</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/perfil")}>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")}>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}