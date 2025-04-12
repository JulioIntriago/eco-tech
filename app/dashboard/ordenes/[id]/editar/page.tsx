"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function EditarOrdenPage() {
  const params = useParams()
  const router = useRouter()
  const [orden, setOrden] = useState<any>(null)
  const [tecnicos, setTecnicos] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.rpc("get_orden_con_historial", {
        id_input: params.id,
      })
      if (error) {
        console.error(error)
        return
      }
      setOrden(data?.[0])
    }

    const fetchTecnicos = async () => {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nombre")
        .eq("rol", "tecnico")
      setTecnicos(data || [])
    }

    fetchData()
    fetchTecnicos()
  }, [params.id])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const { error } = await supabase
      .from("ordenes")
      .update({
        tipo_dispositivo: orden.tipo_dispositivo,
        modelo: orden.modelo,
        problema: orden.problema,
        notas: orden.notas,
        estado: orden.estado,
        fecha_entrega: orden.fecha_entrega,
        prioridad: orden.prioridad,
        tecnico_id: orden.tecnico_id,
      })
      .eq("id", params.id)

    if (error) {
      console.error(error)
      toast({ title: "Error al actualizar la orden." })
      return
    }

    toast({ title: "Orden actualizada correctamente." })
    router.replace(`/dashboard/ordenes/${params.id}`)
}

  if (!orden) return <p className="p-4">Cargando...</p>

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <Card>
        <CardHeader><CardTitle>Editar Orden</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Dispositivo</Label>
            <Input
              value={orden.tipo_dispositivo}
              onChange={(e) => setOrden({ ...orden, tipo_dispositivo: e.target.value })}
            />
          </div>

          <div>
            <Label>Modelo</Label>
            <Input
              value={orden.modelo}
              onChange={(e) => setOrden({ ...orden, modelo: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Problema</Label>
            <Textarea
              value={orden.problema}
              onChange={(e) => setOrden({ ...orden, problema: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Notas</Label>
            <Textarea
              value={orden.notas}
              onChange={(e) => setOrden({ ...orden, notas: e.target.value })}
            />
          </div>

          <div>
            <Label>Fecha de Entrega</Label>
            <Input
              type="date"
              value={orden.fecha_entrega || ""}
              onChange={(e) => setOrden({ ...orden, fecha_entrega: e.target.value })}
            />
          </div>

          <div>
            <Label>Estado</Label>
            <Select
              value={orden.estado}
              onValueChange={(value) => setOrden({ ...orden, estado: value })}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prioridad</Label>
            <Select
              value={orden.prioridad}
              onValueChange={(value) => setOrden({ ...orden, prioridad: value })}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar prioridad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Técnico Asignado</Label>
            <Select
              value={orden.tecnico_id}
              onValueChange={(value) => setOrden({ ...orden, tecnico_id: value })}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar técnico" /></SelectTrigger>
              <SelectContent>
                {tecnicos.map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Guardar Cambios</Button>
      </div>
    </form>
  )
}
