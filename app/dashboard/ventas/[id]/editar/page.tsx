"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Minus, Plus, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function EditarVentaPage() {
  const { id } = useParams()
  const router = useRouter()

  const [clientes, setClientes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [clienteId, setClienteId] = useState("")
  const [metodoPago, setMetodoPago] = useState("")
  const [notas, setNotas] = useState("")
  const [carrito, setCarrito] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const [{ data: clientesData }, { data: inventarioData }, { data: ventaData }, { data: detalles }] =
        await Promise.all([
          supabase.from("clientes").select("*"),
          supabase.from("inventario").select("*"),
          supabase.from("ventas").select("*").eq("id", id).single(),
          supabase.from("ventas_detalle").select("*").eq("venta_id", id),
        ])

      setClientes(clientesData || [])
      setProductos(inventarioData || [])
      setClienteId(ventaData?.cliente_id)
      setMetodoPago(ventaData?.metodo_pago)
      setNotas(ventaData?.notas || "")
      setCarrito(
        detalles?.map((item) => ({
          id: item.inventario_id,
          nombre: inventarioData.find((p) => p.id === item.inventario_id)?.nombre || "—",
          precio: item.precio,
          cantidad: item.cantidad,
          subtotal: item.precio * item.cantidad,
        })) || [],
      )

      setLoading(false)
    }

    fetchData()
  }, [id])

  useEffect(() => {
    const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0)
    const impuesto = subtotal * 0.16
    setTotal(subtotal + impuesto)
  }, [carrito])

  const agregarProducto = (producto: { id: any; nombre: any; precio: any }) => {
    const existente = carrito.find((item) => item.id === producto.id)
    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item,
        ),
      )
    } else {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ])
    }
  }

  const actualizarVenta = async () => {
    if (!clienteId || !metodoPago || carrito.length === 0) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" })
      return
    }

    setLoading(true)

    const totalFinal = carrito.reduce((sum, item) => sum + item.subtotal, 0) * 1.16

    const { error: ventaError } = await supabase
      .from("ventas")
      .update({ cliente_id: clienteId, metodo_pago: metodoPago, notas, total: totalFinal })
      .eq("id", id)

    if (ventaError) {
      toast({ title: "Error al actualizar venta", variant: "destructive" })
      return setLoading(false)
    }

    await supabase.from("ventas_detalle").delete().eq("venta_id", id)

    const nuevosDetalles = carrito.map((item) => ({
      venta_id: id,
      producto_id: item.id,
      inventario_id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.subtotal,
    }))

    await supabase.from("ventas_detalle").insert(nuevosDetalles)

    toast({ title: "Venta actualizada correctamente" })
    router.push(`/dashboard/ventas/${id}`)
  }

  const cambiarCantidad = (id: any, cambio: number) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id && item.cantidad + cambio > 0
          ? {
              ...item,
              cantidad: item.cantidad + cambio,
              subtotal: (item.cantidad + cambio) * item.precio,
            }
          : item,
      ),
    )
  }

  const eliminarProducto = (id: any) => {
    setCarrito(carrito.filter((item) => item.id !== id))
  }

  if (loading) return <div className="p-6">Cargando...</div>

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/ventas/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Editar Venta #{id}</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos en la Venta</CardTitle>
            </CardHeader>
            <CardContent>
              {carrito.length === 0 ? (
                <p className="text-center text-muted-foreground">No hay productos</p>
              ) : (
                carrito.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.precio.toFixed(2)} x {item.cantidad}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => cambiarCantidad(item.id, -1)} size="icon" variant="ghost">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.cantidad}</span>
                      <Button onClick={() => cambiarCantidad(item.id, 1)} size="icon" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => eliminarProducto(item.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell className="text-right">${p.precio?.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{p.cantidad}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => agregarProducto(p)}>
                          Agregar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Método de Pago</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notas</Label>
                <Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas de la venta" />
              </div>

              <div className="flex justify-between pt-4 border-t font-semibold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={actualizarVenta} disabled={loading}>
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
