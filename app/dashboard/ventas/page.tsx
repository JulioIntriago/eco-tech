"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker"

// Datos de ejemplo para ventas
const ventas = [
  {
    id: "VTA-001",
    fecha: "2023-05-15",
    cliente: "Juan Pérez",
    total: 145.99,
    metodo_pago: "Efectivo",
    estado: "completada",
  },
  {
    id: "VTA-002",
    fecha: "2023-05-15",
    cliente: "María López",
    total: 78.5,
    metodo_pago: "Tarjeta",
    estado: "completada",
  },
  {
    id: "VTA-003",
    fecha: "2023-05-14",
    cliente: "Carlos Ruiz",
    total: 35.99,
    metodo_pago: "Transferencia",
    estado: "completada",
  },
  {
    id: "VTA-004",
    fecha: "2023-05-14",
    cliente: "Ana Gómez",
    total: 120.0,
    metodo_pago: "Tarjeta",
    estado: "completada",
  },
  {
    id: "VTA-005",
    fecha: "2023-05-13",
    cliente: "Pedro Sánchez",
    total: 55.75,
    metodo_pago: "Efectivo",
    estado: "completada",
  },
  {
    id: "VTA-006",
    fecha: "2023-05-13",
    cliente: "Lucía Martínez",
    total: 89.99,
    metodo_pago: "Tarjeta",
    estado: "completada",
  },
  {
    id: "VTA-007",
    fecha: "2023-05-12",
    cliente: "Roberto Díaz",
    total: 42.5,
    metodo_pago: "Efectivo",
    estado: "completada",
  },
  {
    id: "VTA-008",
    fecha: "2023-05-12",
    cliente: "Elena Torres",
    total: 67.25,
    metodo_pago: "Transferencia",
    estado: "completada",
  },
]

export default function VentasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(2023, 4, 12), // Mayo 12, 2023
    to: new Date(2023, 4, 15), // Mayo 15, 2023
  })

  // Filtrar ventas según búsqueda y rango de fechas
  const ventasFiltradas = ventas.filter((venta) => {
    const matchesSearch =
      venta.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venta.cliente.toLowerCase().includes(searchQuery.toLowerCase())

    // Si no hay rango de fechas, mostrar todas
    if (!dateRange?.from || !dateRange?.to) return matchesSearch

    // Convertir fechas para comparación
    const ventaDate = new Date(venta.fecha)
    const fromDate = new Date(dateRange.from)
    const toDate = new Date(dateRange.to)

    // Ajustar para comparación de días completos
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)

    const matchesDateRange = ventaDate >= fromDate && ventaDate <= toDate

    return matchesSearch && matchesDateRange
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Ventas</h2>
        <Button asChild>
          <Link href="/dashboard/ventas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Venta
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID o cliente..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full sm:w-auto" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>Registro de todas las ventas realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden md:table-cell">Método de Pago</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No se encontraron ventas que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                ventasFiltradas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell className="font-medium">{venta.id}</TableCell>
                    <TableCell>{venta.fecha}</TableCell>
                    <TableCell>{venta.cliente}</TableCell>
                    <TableCell className="text-right">${venta.total.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{venta.metodo_pago}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/ventas/${venta.id}`}>Ver detalles</Link>
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
  )
}

