"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Categorías disponibles (ajústalas según tu base de datos si es necesario)
const categorias = ["Todas", "Repuestos", "Accesorios", "Cables", "Audio", "Baterías"]

function getEstadoStock(cantidad: number) {
  if (cantidad === 0) return "agotado"
  if (cantidad <= 3) return "bajo"
  return "normal"
}

function getVariantForStock(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    normal: "default",
    bajo: "secondary",
    agotado: "destructive",
  }
  return variantes[estado] || "default"
}

function traducirEstadoStock(estado: string) {
  const traducciones: Record<string, string> = {
    normal: "En Stock",
    bajo: "Stock Bajo",
    agotado: "Agotado",
  }
  return traducciones[estado] || estado
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("Todas")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
        .order("nombre", { ascending: true })

      if (error) {
        console.error("Error al cargar productos:", error)
      } else {
        setProductos(data || [])
      }

      setLoading(false)
    }

    fetchProductos()
  }, [])

  const productosFiltrados = productos.filter((producto) => {
    const matchesSearch =
      producto.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.proveedor?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = filtroCategoria === "Todas" || producto.categoria === filtroCategoria

    return matchesSearch && matchesCategoria
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Inventario</h2>
        <Button asChild>
          <Link href="/dashboard/inventario/nueva">
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : productosFiltrados.length === 0 ? (
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
                      <TableCell className="text-right">${producto.precio?.toFixed(2)}</TableCell>
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
