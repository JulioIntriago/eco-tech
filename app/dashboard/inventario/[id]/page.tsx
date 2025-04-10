"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

export default function ProductoDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProducto = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("inventario")
      .select("*, fk_proveedor(nombre)")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error al cargar producto:", error)
    } else {
      setProducto(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchProducto()
  }, [id])

  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return
    const { error } = await supabase.from("inventario").delete().eq("id", producto.id)
    if (!error) {
      alert("Producto eliminado")
      router.push("/dashboard/inventario")
    } else {
      alert("Error al eliminar producto")
      console.error(error)
    }
  }

  if (loading || !producto) return <div className="p-6">Cargando producto...</div>

  const estadoStock = producto.cantidad === 0 ? "Agotado" : producto.cantidad <= 3 ? "Stock Bajo" : "En Stock"
  const stockVariant = producto.cantidad === 0 ? "destructive" : producto.cantidad <= 3 ? "secondary" : "default"

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/inventario">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Detalle del Producto</h2>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/inventario/${producto.id}/editar`}>
              <Pencil className="w-4 h-4 mr-2" /> Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleEliminar}>
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{producto.nombre}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>Categoría:</strong> {producto.categoria}</div>
          <div><strong>Precio:</strong> ${producto.precio?.toFixed(2)}</div>
          <div><strong>Cantidad:</strong> {producto.cantidad}</div>
          <div><strong>Estado de Stock:</strong> <Badge variant={stockVariant}>{estadoStock}</Badge></div>
<div><strong>Proveedor:</strong> {producto.fk_proveedor?.nombre || "—"}</div>
          <div className="md:col-span-2">
            <strong>Descripción:</strong>
            <p className="text-muted-foreground whitespace-pre-wrap mt-1">{producto.descripcion || "—"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
