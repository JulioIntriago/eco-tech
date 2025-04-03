"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Traduce estado técnico a nombre visual
function traducirEstado(estado: string) {
  const traducciones: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
    activo: "Activo",
  }
  return traducciones[estado] || estado
}

// Define el estilo visual del estado
function getVariantForEstado(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
    activo: "default",
  }
  return variantes[estado] || "default"
}

// Formatea fechas a DD/MM/YYYY
function formatFecha(fecha: string | null) {
  if (!fecha) return "No definida"
  const date = new Date(fecha)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric"
  })
}

// Tipos de datos
type OrdenRaw = {
  id: string
  dispositivo: string
  problema: string
  estado: string
  fecha_ingreso: string
  fecha_entrega: string | null
  costo_estimado: number
  clientes: { nombre: string }[] | null
  empleados: { nombre: string }[] | null
}

type Orden = {
  id: string
  cliente: string
  dispositivo: string
  problema: string
  estado: string
  fecha_ingreso: string
  fecha_entrega: string
  costo_estimado: number
  tecnico_asignado: string
}

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Carga y mapea las órdenes
  const fetchOrdenes = async () => {
    const { data, error } = await supabase
      .from("ordenes")
      .select(`
        id, dispositivo, problema, estado, fecha_ingreso, fecha_entrega, costo_estimado,
        clientes:cliente_id (nombre),
        empleados:tecnico_id (nombre)
      `)

    if (error) {
      console.error("Error al cargar órdenes:", error)
      return
    }

    const ordenesMapeadas = (data as OrdenRaw[]).map((orden) => ({
      id: orden.id,
      cliente: orden.clientes?.[0]?.nombre || "Sin cliente",
      dispositivo: orden.dispositivo,
      problema: orden.problema,
      estado: orden.estado,
      fecha_ingreso: orden.fecha_ingreso,
      fecha_entrega: orden.fecha_entrega || "No definida",
      costo_estimado: orden.costo_estimado,
      tecnico_asignado: orden.empleados?.[0]?.nombre || "Sin asignar",
    }))

    setOrdenes(ordenesMapeadas)
  }

  // Hook principal: carga inicial + subscripción realtime
  useEffect(() => {
    setIsClient(true)
    fetchOrdenes()

    // Subscripción Realtime a la tabla 'ordenes'
    const canal = supabase
      .channel("ordenes_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ordenes" },
        (payload) => {
          console.log("Cambio en orden:", payload.eventType)
          fetchOrdenes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  // Filtro de búsqueda + estado
  const ordenesFiltradas = ordenes.filter((orden) => {
    const search = searchQuery.toLowerCase()
    const matchesSearch =
      orden.id.toLowerCase().includes(search) ||
      orden.cliente.toLowerCase().includes(search) ||
      orden.dispositivo.toLowerCase().includes(search)

    const matchesEstado = filtroEstado === "todos" || orden.estado === filtroEstado

    return matchesSearch && matchesEstado
  })

  if (!isClient) return <p>Cargando...</p>

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />

      {/* Título + Botón */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
        <Button asChild>
          <Link href="/dashboard/ordenes/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, cliente o dispositivo..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_proceso">En Proceso</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Órdenes</CardTitle>
          <CardDescription>Gestiona las órdenes de reparación de dispositivos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Dispositivo</TableHead>
                <TableHead className="hidden lg:table-cell">Problema</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha Ingreso</TableHead>
                <TableHead className="hidden lg:table-cell">Técnico</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No se encontraron órdenes.
                  </TableCell>
                </TableRow>
              ) : (
                ordenesFiltradas.map((orden) => (
                  <TableRow key={orden.id}>
                    <TableCell className="font-medium">{orden.id}</TableCell>
                    <TableCell>{orden.cliente}</TableCell>
                    <TableCell className="hidden md:table-cell">{orden.dispositivo}</TableCell>
                    <TableCell className="hidden lg:table-cell">{orden.problema}</TableCell>
                    <TableCell>
                      <Badge variant={getVariantForEstado(orden.estado)}>
                        {traducirEstado(orden.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatFecha(orden.fecha_ingreso)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{orden.tecnico_asignado}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/ordenes/${orden.id}`}>Ver Detalles</Link>
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
