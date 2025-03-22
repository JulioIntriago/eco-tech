"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Minus, Plus, Search, Trash } from "lucide-react"

// Datos de ejemplo para clientes y productos
const clientes = [
  { id: "CLI-001", nombre: "Juan Pérez" },
  { id: "CLI-002", nombre: "María López" },
  { id: "CLI-003", nombre: "Carlos Ruiz" },
  { id: "CLI-004", nombre: "Ana Gómez" },
  { id: "CLI-005", nombre: "Pedro Sánchez" },
]

const productos = [
  {
    id: "PROD-001",
    nombre: "Pantalla iPhone 12",
    categoria: "Repuestos",
    precio: 120,
    cantidad: 5,
  },
  {
    id: "PROD-002",
    nombre: "Batería Samsung S21",
    categoria: "Repuestos",
    precio: 45,
    cantidad: 8,
  },
  {
    id: "PROD-003",
    nombre: "Cargador USB-C",
    categoria: "Accesorios",
    precio: 15,
    cantidad: 12,
  },
  {
    id: "PROD-004",
    nombre: "Protector Pantalla iPhone 13",
    categoria: "Accesorios",
    precio: 10,
    cantidad: 25,
  },
  {
    id: "PROD-005",
    nombre: "Funda iPhone 12",
    categoria: "Accesorios",
    precio: 18,
    cantidad: 15,
  },
  {
    id: "PROD-006",
    nombre: "Cable Lightning 2m",
    categoria: "Cables",
    precio: 12,
    cantidad: 20,
  },
  {
    id: "PROD-007",
    nombre: "Auriculares Bluetooth",
    categoria: "Audio",
    precio: 35,
    cantidad: 7,
  },
  {
    id: "PROD-008",
    nombre: "Batería Externa 10000mAh",
    categoria: "Baterías",
    precio: 25,
    cantidad: 10,
  },
]

// Métodos de pago disponibles
const metodosPago = ["Efectivo", "Tarjeta", "Transferencia"]

interface ProductoCarrito {
  id: string
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
}

export default function NuevaVentaPage() {
  const router = useRouter()
  const [clienteId, setClienteId] = useState("")
  const [metodoPago, setMetodoPago] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Actualizar total cuando cambia el carrito
  useEffect(() => {
    const nuevoTotal = carrito.reduce((sum, item) => sum + item.subtotal, 0)
    setTotal(nuevoTotal)
  }, [carrito])

  // Agregar producto al carrito
  const agregarProducto = (producto: (typeof productos)[0]) => {
    const productoExistente = carrito.find((item) => item.id === producto.id)

    if (productoExistente) {
      // Si ya existe, incrementar cantidad
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
      // Si no existe, agregar nuevo
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

  // Incrementar cantidad de un producto en el carrito
  const incrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * item.precio,
            }
          : item,
      ),
    )
  }

  // Decrementar cantidad de un producto en el carrito
  const decrementarCantidad = (id: string) => {
    setCarrito(
      carrito.map((item) =>
        item.id === id && item.cantidad > 1
          ? {
              ...item,
              cantidad: item.cantidad - 1,
              subtotal: (item.cantidad - 1) * item.precio,
            }
          : item,
      ),
    )
  }

  // Eliminar producto del carrito
  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.id !== id))
  }

  // Procesar la venta
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío")
      return
    }

    if (!metodoPago) {
      alert("Selecciona un método de pago")
      return
    }

    setLoading(true)

    try {
      // Aquí iría la lógica para guardar en Supabase
      console.log("Datos de la venta:", {
        cliente_id: clienteId,
        metodo_pago: metodoPago,
        total,
        productos: carrito,
      })

      // Simular tiempo de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redireccionar a la lista de ventas
      router.push("/dashboard/ventas")
    } catch (error) {
      console.error("Error al procesar la venta:", error)
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Productos</CardTitle>
              <CardDescription>Busca y agrega productos al carrito</CardDescription>
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
                  {productosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No se encontraron productos que coincidan con la búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell>{producto.categoria}</TableCell>
                        <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{producto.cantidad}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => agregarProducto(producto)}
                            disabled={producto.cantidad === 0}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Agregar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compra</CardTitle>
              <CardDescription>Productos seleccionados para la venta</CardDescription>
            </CardHeader>
            <CardContent>
              {carrito.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  El carrito está vacío. Agrega productos para continuar.
                </div>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.precio.toFixed(2)} x {item.cantidad}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => decrementarCantidad(item.id)}
                            disabled={item.cantidad <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrementar</span>
                          </Button>
                          <div className="flex h-8 w-10 items-center justify-center text-sm">{item.cantidad}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => incrementarCantidad(item.id)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Incrementar</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => eliminarProducto(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente (Opcional)</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anonymous">Cliente Anónimo</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metodo_pago">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago} required>
                    <SelectTrigger id="metodo_pago">
                      <SelectValue placeholder="Selecciona un método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {metodosPago.map((metodo) => (
                        <SelectItem key={metodo} value={metodo}>
                          {metodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex w-full items-center justify-between border-t pt-4">
                <div className="text-lg font-semibold">Total:</div>
                <div className="text-xl font-bold">${total.toFixed(2)}</div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={procesarVenta}
                disabled={carrito.length === 0 || !metodoPago || loading}
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

