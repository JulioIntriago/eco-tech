"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, RefreshCw, Trash2, Pencil } from "lucide-react"

export default function ProveedorDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [proveedor, setProveedor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchProveedor = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("proveedores")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error al cargar proveedor:", error)
    } else {
      setProveedor(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (params?.id) fetchProveedor()
  }, [params?.id])

  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de eliminar este proveedor?")) return
  
    // 1. Eliminar productos asociados (opcional en desarrollo)
    const { error: errorProductos } = await supabase
      .from("inventario")
      .delete()
      .eq("proveedor_id", proveedor.id)
  
    if (errorProductos) {
      alert("No se pudieron eliminar los productos asociados.")
      console.error("Error al eliminar productos:", errorProductos)
      return
    }
  
    // 2. Eliminar proveedor
    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id", proveedor.id)
  
    if (!error) {
      alert("Proveedor eliminado correctamente.")
      router.push("/dashboard/proveedores")
    } else {
      alert("Error al eliminar proveedor.")
      console.error("Error al eliminar proveedor:", error)
    }
  }
  
  if (loading || !proveedor) {
    return <div className="p-6">Cargando proveedor...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/proveedores">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Detalle del Proveedor</h2>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchProveedor}>
            <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/proveedores/${proveedor.id}/editar`}>
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
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>Nombre:</strong> {proveedor.nombre}</div>
          <div><strong>Tipo:</strong> {proveedor.tipo}</div>
          <div><strong>Estado:</strong> <Badge variant={proveedor.estado === "activo" ? "success" : "secondary"}>{proveedor.estado}</Badge></div>
          <div><strong>Creado en:</strong> {new Date(proveedor.creado_en).toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>Teléfono:</strong> {proveedor.telefono}</div>
          <div><strong>Correo:</strong> {proveedor.correo}</div>
          <div><strong>Dirección:</strong> {proveedor.direccion}</div>
          <div><strong>Persona Contacto:</strong> {proveedor.contacto_nombre}</div>
          <div><strong>Teléfono Contacto:</strong> {proveedor.contacto_telefono}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>Productos Asociados:</strong> {proveedor.productos ?? 0}</div>
          <div><strong>Última Compra:</strong> {proveedor.ultima_compra ?? "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {proveedor.notas || "—"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
