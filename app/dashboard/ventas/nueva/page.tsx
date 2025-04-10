"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
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
import { ArrowLeft, Minus, Plus, Search, Trash } from "lucide-react"
import Link from "next/link"

interface Cliente {
  id: string
  nombre: string
}

interface Producto {
  id: string
  nombre: string
  categoria: string
  precio: number
  cantidad: number
}

interface ProductoCarrito {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

const metodosPago = ["Efectivo", "Tarjeta", "Transferencia"]

export default function NuevaVentaPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [clienteId, setClienteId] = useState("")
  const [metodoPago, setMetodoPago] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nombre")
      setClientes(clientesData || [])

      const { data: productosData, error } = await supabase
        .from("inventario")
        .select("id, nombre, precio, cantidad, categoria")

      if (error) console.error("Error al cargar productos:", error)
      setProductos(productosData || [])
    }

    fetchData()
  }, [])

  useEffect(() => {
    const totalCalculado = carrito.reduce((acc, item) => acc + item.subtotal, 0)
    setTotal(totalCalculado)
  }, [carrito])

  const agregarProducto = (producto: Producto) => {
    if (producto.cantidad <= 0) {
      alert("No hay suficiente stock para agregar más productos.")
      return
    }

    const existe = carrito.find((item) => item.id === producto.id)
    if (existe) {
      // Si ya existe el producto en el carrito, incrementamos la cantidad y el subtotal
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item
        )
      )

      // También disminuimos el stock en el inventario visual
      setProductos(
        productos.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
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

      // Reducir el stock visualmente
      setProductos(
        productos.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
      )
    }
  }

  const incrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precio,
            }
          : item
      )
    )
  }

  const decrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id && item.cantidad > 1
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: (item.cantidad - 1) * item.precio,
            }
          : item
      )
    )
  }

  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.id !== id))
  }

  const procesarVenta = async () => {
    if (carrito.length === 0 || !metodoPago) {
      alert("Completa todos los campos.")
      return
    }

    setLoading(true)

    try {
      const { data: userSession } = await supabase.auth.getUser()
      const usuario_id = userSession.user?.id

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", usuario_id)
        .single()

      const { data: venta, error: errorVenta } = await supabase
        .from("ventas")
        .insert([
          {
            cliente_id: clienteId === "anonymous" ? null : clienteId,
            metodo_pago: metodoPago,
            total: total,
            usuario_id,
            empresa_id: perfil?.empresa_id,
          },
        ])
        .select()
        .single()

      if (errorVenta) throw errorVenta

      const detalles = carrito.map((item) => ({
        venta_id: venta.id,
        producto_id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.subtotal,
      }))

      const { error: errorDetalle } = await supabase
        .from("ventas_detalle")
        .insert(detalles)

      if (errorDetalle) throw errorDetalle

      // Actualizar el stock en la base de datos
      await Promise.all(
        carrito.map((item) =>
          supabase
            .from("inventario")
            .update({
              cantidad: supabase
                .rpc('subtract_stock', { cantidad: item.cantidad, producto_id: item.id }), // Llamada a la función RPC en Supabase
            })
              .eq("id", item.id)
        )
      )

      router.push("/dashboard/ventas")
    } catch (error) {
      console.error("Error al procesar venta:", error)
      alert("Ocurrió un error al guardar la venta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/ventas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Venta</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Sección productos */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.categoria}</TableCell>
                      <TableCell className="text-right">${p.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{p.cantidad}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => agregarProducto(p)}
                          disabled={p.cantidad === 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
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

        {/* Sección carrito */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Venta</CardTitle>
            </CardHeader>
            <CardContent>
              {carrito.length === 0 ? (
                <p className="text-center text-muted-foreground">Agrega productos</p>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.precio.toFixed(2)} x {item.cantidad}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => decrementarCantidad(item.id)}
                          disabled={item.cantidad <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.cantidad}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => incrementarCantidad(item.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => eliminarProducto(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="space-y-2 w-full">
                <Label>Cliente (opcional)</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">Anónimo</SelectItem>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Método de Pago</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPago.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between w-full pt-4 border-t">
                <span className="font-bold text-lg">Total:</span>
                <span className="text-xl font-bold">${total.toFixed(2)}</span>
              </div>

              <Button
                className="w-full"
                onClick={procesarVenta}
                disabled={loading || carrito.length === 0 || !metodoPago}
              >
                {loading ? "Procesando..." : "Completar Venta"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
