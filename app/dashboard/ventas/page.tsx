"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
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
import { Plus, Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker"
import type { DateRange } from "react-day-picker"

interface Venta {
  id: string
  fecha: string
  fechaFormateada?: string
  total: number
  metodo_pago: string
  cliente_id: string | null
  cliente?: {
    id: string
    nombre: string
  } | null
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true)
      try {
        const { data: session } = await supabase.auth.getUser()
        const usuario_id = session.user?.id

        const { data: perfil, error: errorPerfil } = await supabase
          .from("usuarios")
          .select("empresa_id")
          .eq("id", usuario_id)
          .single()

        if (errorPerfil) {
          console.error("Error al obtener perfil:", errorPerfil.message || errorPerfil)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("ventas")
          .select(`
            id,
            fecha,
            total,
            metodo_pago,
            cliente_id,
            cliente:clientes (
              id,
              nombre
            )
          `)
          .eq("empresa_id", perfil?.empresa_id)
          .order("fecha", { ascending: false })

        if (error) {
          console.error("Error al cargar ventas:", error.message || JSON.stringify(error, null, 2))
        } else {
          const ventasConFecha = (data as unknown as Venta[]).map((venta) => ({
            ...venta,
            fechaFormateada: format(new Date(venta.fecha), "dd/MM/yyyy"),
          }))
          setVentas(ventasConFecha)
        }
      } catch (error: any) {
        console.error("Error inesperado al cargar ventas:", error.message || error)
      }

      setLoading(false)
    }

    fetchVentas()
  }, [])

  const ventasFiltradas = ventas.filter((venta) => {
    const matchesSearch =
      venta.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venta.cliente?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())

    if (dateRange?.from && dateRange?.to) {
      const ventaDate = new Date(venta.fecha)
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)

      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(23, 59, 59, 999)

      const matchesDateRange = ventaDate >= fromDate && ventaDate <= toDate
      return matchesSearch && matchesDateRange
    }

    return matchesSearch
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
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-ms-editor="false"
          />
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Cargando ventas...
                  </TableCell>
                </TableRow>
              ) : ventasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No se encontraron ventas que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                ventasFiltradas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell className="font-medium">{venta.id}</TableCell>
                    <TableCell>{venta.fechaFormateada}</TableCell>
                    <TableCell>{venta.cliente?.nombre || "Anónimo"}</TableCell>
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
