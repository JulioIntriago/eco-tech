"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type HistorialItem = {
  id: string
  fecha: string
  accion: string
  comentario: string
  usuario_nombre: string
}

const traducciones: Record<string, string> = {
  estado_actualizado: "Actualización de Estado",
  creado: "Orden creada",
  asignado: "Técnico asignado",
  nota: "Nota agregada",
}

export function OrdenHistorial({ ordenId }: { ordenId: string }) {
  const [historial, setHistorial] = useState<HistorialItem[]>([])

  useEffect(() => {
    const fetchHistorial = async () => {
      const { data, error } = await supabase.rpc("get_historial_orden", {
        id_input: ordenId,
      })

      if (error) {
        console.error("Error al cargar historial", error)
        return
      }

      setHistorial(data)
    }

    fetchHistorial()
  }, [ordenId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de la Orden</CardTitle>
        <p className="text-muted-foreground text-sm">Registro de cambios y actualizaciones</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {historial.length > 0 ? (
          <div className="space-y-6">
            {historial.map((item) => (
              <div key={item.id} className="relative pl-10 border-l border-muted">
                {/* Ícono redondo con letra de la acción */}
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-xs flex items-center justify-center">
                  {item.accion?.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between flex-wrap">
                    <span className="text-sm font-medium">
                      {new Date(item.fecha).toLocaleString()}
                    </span>
                    <Badge variant="default">
                      {traducciones[item.accion] || item.accion.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm">{item.comentario}</p>
                  <p className="text-xs text-muted-foreground">Por: {item.usuario_nombre || "Desconocido"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay historial disponible.</p>
        )}
      </CardContent>
    </Card>
  )
}
