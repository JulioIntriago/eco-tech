"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Printer, Trash } from "lucide-react"
import { OrdenHistorial } from "@/components/ordenes/OrdenHistorial"

const traducciones: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  finalizado: "Finalizado",
  entregado: "Entregado",
  estado_actualizado: "Actualizado"
}

const getVariantForEstado = (estado: string) => {
  switch (estado) {
    case "pendiente":
      return "secondary"
    case "en_proceso":
      return "default"
    case "finalizado":
      return "success"
    case "entregado":
      return "outline"
    default:
      return "default"
  }
}

export default function DetalleOrdenPage() {
  const params = useParams()
  const router = useRouter()
  const [orden, setOrden] = useState<any>(null)

  useEffect(() => {
    const fetchOrden = async () => {
      const { data, error } = await supabase.rpc("get_orden_con_historial", {
        id_input: params.id
      })

      if (error) {
        console.error("Error al obtener orden:", error)
        return
      }

      setOrden(data?.[0])
    }

    fetchOrden()
  }, [params.id])

  if (!orden) return <p className="p-4">Cargando...</p>

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            Orden #{orden.id.slice(0, 8)}
          </h2>
          <Badge variant={getVariantForEstado(orden.estado)}>{traducciones[orden.estado]}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
          <Button
  variant="outline"
  onClick={() => router.push(`/dashboard/ordenes/${params.id}/editar`)}
>
  <Edit className="w-4 h-4 mr-2" /> Editar
</Button>
          <Button variant="destructive"><Trash className="w-4 h-4 mr-2" /> Eliminar</Button>
        </div>
      </div>

      <Tabs defaultValue="detalles">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="detalles" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Información del Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><strong>Nombre:</strong> {orden.cliente_nombre}</p>
                <p><strong>Teléfono:</strong> {orden.cliente_telefono}</p>
                <p><strong>Correo:</strong> {orden.cliente_correo}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Información del Dispositivo</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><strong>Tipo:</strong> {orden.tipo_dispositivo}</p>
                <p><strong>Modelo:</strong> {orden.modelo}</p>
                <p><strong>Problema:</strong> {orden.problema}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Detalles de la Reparación</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Fecha de Ingreso:</strong> {new Date(orden.fecha_ingreso).toLocaleDateString()}</p>
                <p><strong>Fecha de Entrega Estimada:</strong> {orden.fecha_entrega ? new Date(orden.fecha_entrega).toLocaleDateString() : "Pendiente"}</p>
                <p><strong>Costo Estimado:</strong> ${orden.costo_estimado}</p>
              </div>
              <div>
                <p><strong>Técnico Asignado:</strong> {orden.tecnico_nombre}</p>
                <strong>Estado Actual:</strong> <Badge variant={getVariantForEstado(orden.estado)}>{traducciones[orden.estado]}</Badge>
                </div>
              <div className="md:col-span-2">
                <p><strong>Notas:</strong></p>
                <p className="text-muted-foreground">{orden.notas || "Sin notas"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

       <TabsContent value="historial" className="mt-4">
  <OrdenHistorial ordenId={params.id as string} />
</TabsContent>
      </Tabs>
    </div>
  )
}
