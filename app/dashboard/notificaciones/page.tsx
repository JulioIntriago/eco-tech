"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Bell, CheckCircle, AlertCircle, Package, ClipboardList, ShoppingCart, Calendar } from "lucide-react"

// Mapeo de iconos desde string a componente
const iconos: Record<string, any> = {
  bell: Bell,
  alerta: AlertCircle,
  exito: CheckCircle,
  paquete: Package,
  orden: ClipboardList,
  venta: ShoppingCart,
  calendario: Calendar,
}

export default function NotificacionesPage() {
  const [notificacionesData, setNotificacionesData] = useState<any[]>([])
  const [usuarioId, setUsuarioId] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUsuarioId(user.id)

      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", user.id)
        .order("fecha_creacion", { ascending: false })

      if (!error) {
        setNotificacionesData(data || [])
      } else {
        console.error("Error al obtener notificaciones:", error)
      }
    }

    fetchNotificaciones()
  }, [])

  // Realtime para notificaciones del usuario
  useEffect(() => {
    if (!usuarioId) return

    const channel = supabase
      .channel("realtime-notificaciones")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificaciones",
          filter: `usuario_id=eq.${usuarioId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotificacionesData((prev) => [payload.new, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setNotificacionesData((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            )
          } else if (payload.eventType === "DELETE") {
            setNotificacionesData((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [usuarioId])

  const marcarTodasLeidas = async () => {
    if (!usuarioId) return
    await supabase.from("notificaciones").update({ leida: true }).eq("usuario_id", usuarioId)
    setNotificacionesData((prev) => prev.map((n) => ({ ...n, leida: true })))
  }

  const marcarLeida = async (id: string) => {
    await supabase.from("notificaciones").update({ leida: true }).eq("id", id)
    setNotificacionesData((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    )
  }

  const noLeidas = notificacionesData.filter((n) => !n.leida).length

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader notificacionesNoLeidas={noLeidas} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Notificaciones</h2>
          {noLeidas > 0 && <Badge variant="default">{noLeidas} nuevas</Badge>}
        </div>
        {noLeidas > 0 && (
          <Button variant="outline" onClick={marcarTodasLeidas}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centro de Notificaciones</CardTitle>
          <CardDescription>Mantente al día con las actualizaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificacionesData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No hay notificaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Las notificaciones aparecerán aquí cuando haya actualizaciones importantes.
                </p>
              </div>
            ) : (
              notificacionesData.map((notificacion) => {
                const Icon = iconos[notificacion.icono || "bell"] || Bell
                const iconColor =
                  notificacion.tipo === "alerta"
                    ? "text-destructive"
                    : notificacion.tipo === "exito"
                    ? "text-success"
                    : "text-primary"

                return (
                  <div
                    key={notificacion.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      !notificacion.leida ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className={`mt-1 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notificacion.titulo}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notificacion.fecha_creacion).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notificacion.leida && (
                        <Button variant="ghost" size="sm" onClick={() => marcarLeida(notificacion.id)}>
                          Marcar como leída
                        </Button>
                      )}
                      {notificacion.enlace && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={notificacion.enlace}>Ver detalles</a>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
