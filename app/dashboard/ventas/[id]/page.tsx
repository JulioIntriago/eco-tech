"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Edit, Printer, Trash, Download, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function VentaDetallePage() {
  const { id } = useParams()
  const router = useRouter()

  const [venta, setVenta] = useState<any>(null)
  const [detallesVenta, setDetallesVenta] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVenta = async () => {
      setLoading(true)

      // Traer venta con cliente y usuario
      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .select(`
          *,
          clientes (id, nombre, telefono, correo),
          usuarios:usuario_id (id, nombre)
        `)
        .eq("id", id)
        .single()

      if (ventaError || !ventaData) {
        console.error("Error al cargar la venta:", ventaError)
        toast({
          title: "Error",
          description: "No se encontró la venta.",
          variant: "destructive",
        })
        router.push("/dashboard/ventas")
        return
      }

      setVenta(ventaData)

      // Detalles de productos
      const { data: detallesData, error: detallesError } = await supabase
        .from("ventas_detalle")
        .select(`
          *,
  inventario:inventario_id (id, nombre)
        `)
        .eq("venta_id", id)

      if (detallesError) {
        console.error("Error al cargar los detalles de la venta:", detallesError?.message || detallesError)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos.",
          variant: "destructive",
        })  

        setDetallesVenta([]) // Por si no vienen producto


      } else {
        setDetallesVenta(detallesData)
      }

      setLoading(false)
    }

    if (id) fetchVenta()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta venta?")) return
    setLoading(true)

    const { error } = await supabase.from("ventas").delete().eq("id", id)
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la venta.", variant: "destructive" })
    } else {
      toast({ title: "Venta eliminada", description: "Se eliminó correctamente." })
      router.push("/dashboard/ventas")
    }

    setLoading(false)
  }

  const handlePrint = () => {
    toast({ title: "Imprimiendo", description: "La factura se está imprimiendo..." })
  }

  const handleDownload = () => {
    toast({ title: "Descargando", description: "La factura se está descargando..." })
  }

  if (loading || !venta) return <div className="p-6">Cargando...</div>

  const calcularSubtotal = () =>
    detallesVenta.reduce((total, p) => total + p.precio * p.cantidad, 0)

  const impuesto = calcularSubtotal() * 0.16
  const total = calcularSubtotal() + impuesto

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/ventas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Venta #{venta.id}</h2>
          <Badge variant="success">{venta.estado}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/ventas/${venta.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detalles">
        <TabsList>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
        </TabsList>

        {/* Detalles de venta */}
        <TabsContent value="detalles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-semibold">Información de la Venta</h3>
                <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}</p>
                <p><strong>Vendedor:</strong> {venta.usuarios?.nombre || "—"}</p>
                <p><strong>Método de pago:</strong> {venta.metodo_pago}</p>
                <p><strong>Estado:</strong> <Badge>{venta.estado}</Badge></p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-semibold">Resumen</h3>
                <p><strong>Subtotal:</strong> ${calcularSubtotal().toFixed(2)}</p>
                <p><strong>Impuesto (16%):</strong> ${impuesto.toFixed(2)}</p>
                <p className="text-lg font-bold"><strong>Total:</strong> ${total.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Productos vendidos en esta orden</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detallesVenta.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell>{prod.inventario?.nombre || prod.nombre}</TableCell>
                      <TableCell className="text-center">{prod.cantidad}</TableCell>
                      <TableCell className="text-right">${prod.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(prod.precio * prod.cantidad).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Cliente */}
        <TabsContent value="cliente" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Información del Cliente</CardTitle>
                <CardDescription>Datos asociados a esta venta</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/clientes/${venta.clientes?.id}`}>
                  <User className="mr-2 h-4 w-4" />
                  Ver Cliente
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p><strong>Nombre:</strong> {venta.clientes?.nombre}</p>
              <p><strong>Teléfono:</strong> {venta.clientes?.telefono || "—"}</p>
              <p><strong>Correo:</strong> {venta.clientes?.correo || "—"}</p>
              <p><strong>ID Cliente:</strong> {venta.clientes?.id}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
