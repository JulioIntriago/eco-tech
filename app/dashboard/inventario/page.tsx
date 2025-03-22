"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Datos de ejemplo para productos
const productos = [
  {
    id: "PROD-001",
    nombre: "Pantalla iPhone 12",
    categoria: "Repuestos",
    precio: 120,
    cantidad: 5,
    proveedor: "TechParts Inc.",
  },
  {
    id: "PROD-002",
    nombre: "Batería Samsung S21",
    categoria: "Repuestos",
    precio: 45,
    cantidad: 8,
    proveedor: "BatteryPlus",
  },
  {
    id: "PROD-003",
    nombre: "Cargador USB-C",
    categoria: "Accesorios",
    precio: 15,
    cantidad: 2,
    proveedor: "ElectroSupply",
  },
  {
    id: "PROD-004",
    nombre: "Protector Pantalla iPhone 13",
    categoria: "Accesorios",
    precio: 10,
    cantidad: 25,
    proveedor: "ScreenGuard",
  },
  {
    id: "PROD-005",
    nombre: "Funda iPhone 12",
    categoria: "Accesorios",
    precio: 18,
    cantidad: 3,
    proveedor: "CaseMakers",
  },
  {
    id: "PROD-006",
    nombre: "Cable Lightning 2m",
    categoria: "Cables",
    precio: 12,
    cantidad: 15,
    proveedor: "ElectroSupply",
  },
  {
    id: "PROD-007",
    nombre: "Auriculares Bluetooth",
    categoria: "Audio",
    precio: 35,
    cantidad: 7,
    proveedor: "SoundTech",
  },
  {
    id: "PROD-008",
    nombre: "Batería Externa 10000mAh",
    categoria: "Baterías",
    precio: 25,
    cantidad: 10,
    proveedor: "PowerBank Co.",
  },
  {
    id: "PROD-009",
    nombre: "Pantalla Xiaomi Redmi Note 10",
    categoria: "Repuestos",
    precio: 85,
    cantidad: 4,
    proveedor: "TechParts Inc.",
  },
  {
    id: "PROD-010",
    nombre: "Micrófono Samsung S20",
    categoria: "Repuestos",
    precio: 22,
    cantidad: 0,
    proveedor: "MicroTech",
  },
]

// Categorías disponibles
const categorias = ["Todas", "Repuestos", "Accesorios", "Cables", "Audio", "Baterías"]

// Función para determinar el estado del stock
function getEstadoStock(cantidad: number) {
  if (cantidad === 0) return "agotado"
  if (cantidad <= 3) return "bajo"
  return "normal"
}

// Función para obtener la variante del badge según el estado del stock
function getVariantForStock(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    normal: "default",
    bajo: "secondary",
    agotado: "destructive",
  }
  return variantes[estado] || "default"
}

// Función para traducir el estado del stock
function traducirEstadoStock(estado: string) {
  const traducciones: Record<string, string> = {
    normal: "En Stock",
    bajo: "Stock Bajo",
    agotado: "Agotado",
  }
  return traducciones[estado] || estado
}

export default function InventarioPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")

  // Filtrar productos según búsqueda y categoría
  const productosFiltrados = productos.filter((producto) => {
    const matchesSearch =
      producto.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.proveedor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = filtroCategoria === "Todas" || producto.categoria === filtroCategoria

    return matchesSearch && matchesCategoria
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
        <Button asChild>
          <Link href="/dashboard/inventario/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, ID o proveedor..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Productos</CardTitle>
          <CardDescription>Gestiona el inventario de productos y repuestos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="hidden lg:table-cell">Proveedor</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron productos que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((producto) => {
                  const estadoStock = getEstadoStock(producto.cantidad)
                  return (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.id}</TableCell>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell">{producto.categoria}</TableCell>
                      <TableCell className="text-right">${producto.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{producto.cantidad}</span>
                          <Badge variant={getVariantForStock(estadoStock)}>{traducirEstadoStock(estadoStock)}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{producto.proveedor}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/inventario/${producto.id}`}>Ver detalles</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

