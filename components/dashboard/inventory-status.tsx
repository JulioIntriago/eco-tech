"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function InventoryStatus() {
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    const fetchStockBajo = async () => {
      const { data, error } = await supabase
        .from("inventario")
        .select("id, nombre, categoria, cantidad, precio")
        .lte("cantidad", 10) // productos con stock bajo o igual a 10
        .gt("cantidad", 0)  // solo productos con cantidad mayor que 0
        .order("cantidad", { ascending: true })

      if (error) {
        console.error("Error al cargar productos con stock bajo:", error)
      } else {
        setProductos(data || [])
      }
    }

    fetchStockBajo()
  }, [])

  const getEstadoStock = (cantidad: number) => {
    if (cantidad === 0) return "Agotado"
    if (cantidad <= 10) return "Bajo"
    return "Normal"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estado del Inventario</CardTitle>
          <CardDescription>Productos con stock bajo o agotados</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/inventario">Ver todo</a>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="hidden md:table-cell">{item.categoria}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.cantidad}
                    {getEstadoStock(item.cantidad) !== "Normal" && (
                      <Badge
                        variant={getEstadoStock(item.cantidad) === "Agotado" ? "destructive" : "secondary"}
                        className="ml-2"
                      >
                        {getEstadoStock(item.cantidad) === "Agotado" ? "Agotado" : "Stock Bajo"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">${parseFloat(item.precio).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
