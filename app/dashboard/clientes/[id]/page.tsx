
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Trash } from "lucide-react"

// Traducción de estado
const traducirEstado = (estado: string) => ({
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  finalizado: "Finalizado",
  entregado: "Entregado",
}[estado] || estado)

type BadgeVariant = "secondary" | "default" | "success" | "outline" | "destructive"

function getVariantForEstado(estado: string): BadgeVariant {
  const variantes: Record<string, BadgeVariant> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
  }

  return variantes[estado] ?? "default"
}

export default function DetalleClientePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const fetchCliente = async () => {
      setCargando(true)

      const { data: clienteData, error: errorCliente } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", params.id)
        .single()

      if (errorCliente) {
        console.error("Error al obtener cliente:", errorCliente)
        setCargando(false)
        return
      }

      const { data: ordenes } = await supabase
        .from("ordenes")
        .select("*")
        .eq("cliente_id", params.id)

      const { data: compras } = await supabase
        .from("ventas")
        .select(`
          *,
          productos_venta (
            nombre,
            cantidad,
            precio
          )
        `)
        .eq("cliente_id", params.id)

      setCliente({
        ...clienteData,
        ordenes: ordenes || [],
        compras: compras || [],
      })

      setCargando(false)
    }

    fetchCliente()
  }, [params.id])

  const handleEliminarCliente = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      setLoading(true)
      const { error } = await supabase.from("clientes").delete().eq("id", params.id)

      if (error) {
        console.error("Error al eliminar el cliente:", error)
        alert("Error al eliminar el cliente")
        setLoading(false)
        return
      }

      router.push("/dashboard/clientes")
    }
  }

  if (cargando || !cliente) {
    return <div className="p-6">Cargando datos del cliente...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clientes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{cliente.nombre}</h2>
          <span className="text-sm text-muted-foreground">{cliente.id}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clientes/${params.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleEliminarCliente} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="informacion">
        <TabsList>
          <TabsTrigger value="informacion">Información</TabsTrigger>
          <TabsTrigger value="ordenes">Órdenes</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="informacion" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Datos de Contacto</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Teléfono</dt>
                  <dd className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.telefono}</span>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Correo Electrónico</dt>
                  <dd className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.correo}</span>
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Dirección</dt>
                  <dd className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{cliente.direccion}</span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Resumen de Actividad</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Órdenes Totales</dt>
                  <dd className="text-2xl font-bold">{cliente.ordenes.length}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Compras Totales</dt>
                  <dd className="text-2xl font-bold">{cliente.compras.length}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">Total Gastado</dt>
                  <dd className="text-2xl font-bold">
                    ${cliente.compras.reduce((sum: number, compra: any) => sum + compra.total, 0).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ordenes">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Órdenes</CardTitle>
              <CardDescription>Órdenes de reparación del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Problema</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cliente.ordenes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Este cliente no tiene órdenes registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cliente.ordenes.map((orden: any) => (
                      <TableRow key={orden.id}>
                        <TableCell>
                          <Link href={`/dashboard/ordenes/${orden.id}`} className="text-primary hover:underline">
                            {orden.id}
                          </Link>
                        </TableCell>
                        <TableCell>{orden.dispositivo}</TableCell>
                        <TableCell>{orden.problema}</TableCell>
                        <TableCell>
                          <Badge variant={getVariantForEstado(orden.estado)}>
                            {traducirEstado(orden.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell>{orden.fecha_ingreso?.split("T")[0]}</TableCell>
                        <TableCell className="text-right">${orden.costo_estimado?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compras">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
              <CardDescription>Compras realizadas por el cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cliente.compras.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    Este cliente no tiene compras registradas.
                  </div>
                ) : (
                  cliente.compras.map((compra: any) => (
                    <div key={compra.id} className="rounded-lg border">
                      <div className="flex items-center justify-between border-b p-4">
                        <div>
                          <Link
                            href={`/dashboard/ventas/${compra.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {compra.id}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            Fecha: {compra.fecha?.split("T")[0]} — Método: {compra.metodo_pago}
                          </div>
                        </div>
                        <div className="text-right text-lg font-bold">${compra.total.toFixed(2)}</div>
                      </div>
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead className="text-center">Cantidad</TableHead>
                              <TableHead className="text-right">Precio</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {compra.productos_venta?.map((producto: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell className="text-center">{producto.cantidad}</TableCell>
                                <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
