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
import { Plus, Search, Upload, Download } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

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
  const [filtroEstadoStock, setFiltroEstadoStock] = useState("todos")
  const [loading, setLoading] = useState(true)

  const fetchProductos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("inventario")
      .select(`*, proveedor:proveedor_id(nombre)`)
      .order("nombre", { ascending: true })

    if (error) console.error("Error al cargar productos:", error)
    else setProductos(data || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchProductos()

    const channel = supabase
      .channel("realtime-inventario")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "inventario",
      }, () => {
        fetchProductos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const productosFiltrados = productos.filter((producto) => {
    const estadoStock = getEstadoStock(producto.cantidad)

    const matchesSearch =
      producto.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.proveedor?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategoria = filtroCategoria === "Todas" || producto.categoria === filtroCategoria
    const matchesEstadoStock =
      filtroEstadoStock === "todos" ||
      (filtroEstadoStock === "normal" && estadoStock === "normal") ||
      (filtroEstadoStock === "bajo" && estadoStock === "bajo") ||
      (filtroEstadoStock === "agotado" && estadoStock === "agotado")

    return matchesSearch && matchesCategoria && matchesEstadoStock
  })

  const totalProductos = productos.length
  const productosAgotados = productos.filter((p) => p.cantidad === 0).length
  const productosBajoStock = productos.filter((p) => p.cantidad > 0 && p.cantidad <= 3).length
  const valorInventario = productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0)
  const exportarExcel = async () => {
    try {
      const { utils, write, writeFile } = await import("xlsx")
      const { saveAs } = await import("file-saver")
  
      const data = productosFiltrados.map((p) => ({
        ID: p.id,
        Producto: p.nombre,
        Categoría: p.categoria,
        Precio: p.precio,
        Stock: p.cantidad,
        Proveedor: p.proveedor?.nombre || "—",
      }))
  
      const ws = utils.json_to_sheet(data)
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, "Inventario")
  
      const excelBuffer = write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
      saveAs(blob, `inventario_${new Date().toISOString()}.xlsx`)
    } catch (error) {
      console.error("Error al exportar Excel:", error)
      alert("No se pudo exportar el archivo. Asegúrate de tener las dependencias instaladas.")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total de Productos</p><p className="text-2xl font-bold">{totalProductos}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Agotados</p><p className="text-2xl font-bold">{productosAgotados}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Bajo Stock</p><p className="text-2xl font-bold">{productosBajoStock}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Valor del Inventario</p><p className="text-2xl font-bold">${valorInventario.toFixed(2)}</p></CardContent></Card>
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
              <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroEstadoStock} onValueChange={setFiltroEstadoStock}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="normal">En Stock</SelectItem>
            <SelectItem value="bajo">Stock Bajo</SelectItem>
            <SelectItem value="agotado">Agotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Listado de Productos</CardTitle>
              <CardDescription>Gestiona el inventario de productos y repuestos</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={exportarExcel} variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar Excel
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Importar Excel
              </Button>
              <Button asChild>
                <Link href="/dashboard/inventario/nueva">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                </Link>
              </Button>
            </div>
          </div>
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
                  <TableCell colSpan={7} className="text-center">No se encontraron productos.</TableCell>
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
                      <TableCell className="hidden lg:table-cell">{producto.proveedor?.nombre || "—"}</TableCell>
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
