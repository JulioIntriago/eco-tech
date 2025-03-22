"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Bell, CheckCircle, AlertCircle, Package, ClipboardList, ShoppingCart, Calendar } from "lucide-react"

// Datos de ejemplo para notificaciones
const notificaciones = [
  {
    id: "NOT-001",
    tipo: "alerta",
    titulo: "Stock bajo de productos",
    mensaje: "Hay 5 productos con stock bajo que requieren reposición.",
    fecha: "2023-05-15 09:30",
    leida: false,
    accion: "/dashboard/inventario",
    icono: Package,
  },
  {
    id: "NOT-002",
    tipo: "info",
    titulo: "Nueva orden de trabajo",
    mensaje: "Se ha registrado una nueva orden de trabajo: ORD-008.",
    fecha: "2023-05-15 08:45",
    leida: false,
    accion: "/dashboard/ordenes/ORD-008",
    icono: ClipboardList,
  },
  {
    id: "NOT-003",
    tipo: "exito",
    titulo: "Venta completada",
    mensaje: "Se ha completado la venta VTA-008 por $67.25.",
    fecha: "2023-05-14 16:20",
    leida: true,
    accion: "/dashboard/ventas/VTA-008",
    icono: ShoppingCart,
  },
  {
    id: "NOT-004",
    tipo: "info",
    titulo: "Orden finalizada",
    mensaje: "La orden ORD-003 ha sido marcada como finalizada.",
    fecha: "2023-05-14 14:10",
    leida: true,
    accion: "/dashboard/ordenes/ORD-003",
    icono: CheckCircle,
  },
  {
    id: "NOT-005",
    tipo: "alerta",
    titulo: "Órdenes pendientes",
    mensaje: "Hay 2 órdenes pendientes que requieren asignación de técnico.",
    fecha: "2023-05-14 09:15",
    leida: true,
    accion: "/dashboard/ordenes",
    icono: AlertCircle,
  },
  {
    id: "NOT-006",
    tipo: "info",
    titulo: "Recordatorio de pago",
    mensaje: "Recordatorio: El pago al proveedor TechParts Inc. vence mañana.",
    fecha: "2023-05-13 15:30",
    leida: true,
    accion: "/dashboard/proveedores/PROV-001",
    icono: Calendar,
  },
]

export default function NotificacionesPage() {
  const [notificacionesData, setNotificacionesData] = useState(notificaciones)

  // Marcar todas como leídas
  const marcarTodasLeidas = () => {
    setNotificacionesData(
      notificacionesData.map((notificacion) => ({
        ...notificacion,
        leida: true,
      })),
    )
  }

  // Marcar una notificación como leída
  const marcarLeida = (id: string) => {
    setNotificacionesData(
      notificacionesData.map((notificacion) =>
        notificacion.id === id ? { ...notificacion, leida: true } : notificacion,
      ),
    )
  }

  // Contar notificaciones no leídas
  const noLeidas = notificacionesData.filter((n) => !n.leida).length

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Notificaciones</h2>
          {noLeidas > 0 && (
            <Badge variant="default" className="ml-2">
              {noLeidas} nuevas
            </Badge>
          )}
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
                // Determinar el color del icono según el tipo
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
                      <notificacion.icono className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notificacion.titulo}</h4>
                        <span className="text-xs text-muted-foreground">{notificacion.fecha}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notificacion.leida && (
                        <Button variant="ghost" size="sm" onClick={() => marcarLeida(notificacion.id)}>
                          Marcar como leída
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={notificacion.accion}>Ver detalles</a>
                      </Button>
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

