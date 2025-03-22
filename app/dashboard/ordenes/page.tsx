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

// Datos de ejemplo para órdenes de trabajo
const ordenes = [
  {
    id: "ORD-001",
    cliente: "Juan Pérez",
    dispositivo: "iPhone 12",
    problema: "Pantalla rota",
    estado: "pendiente",
    fecha_ingreso: "2023-05-15",
    fecha_entrega: null,
    costo_estimado: 120,
    tecnico_asignado: null,
  },
  {
    id: "ORD-002",
    cliente: "María López",
    dispositivo: "Samsung S21",
    problema: "Batería",
    estado: "en_proceso",
    fecha_ingreso: "2023-05-14",
    fecha_entrega: null,
    costo_estimado: 45,
    tecnico_asignado: "Carlos Ruiz",
  },
  {
    id: "ORD-003",
    cliente: "Carlos Ruiz",
    dispositivo: "Xiaomi Mi 11",
    problema: "No enciende",
    estado: "finalizado",
    fecha_ingreso: "2023-05-13",
    fecha_entrega: "2023-05-16",
    costo_estimado: 80,
    tecnico_asignado: "Laura Méndez",
  },
  {
    id: "ORD-004",
    cliente: "Ana Gómez",
    dispositivo: "Motorola G9",
    problema: "Micrófono",
    estado: "entregado",
    fecha_ingreso: "2023-05-12",
    fecha_entrega: "2023-05-15",
    costo_estimado: 35,
    tecnico_asignado: "Carlos Ruiz",
  },
  {
    id: "ORD-005",
    cliente: "Pedro Sánchez",
    dispositivo: "iPhone 11",
    problema: "Cámara",
    estado: "en_proceso",
    fecha_ingreso: "2023-05-11",
    fecha_entrega: null,
    costo_estimado: 60,
    tecnico_asignado: "Laura Méndez",
  },
  {
    id: "ORD-006",
    cliente: "Lucía Martínez",
    dispositivo: "Huawei P40",
    problema: "Altavoz",
    estado: "pendiente",
    fecha_ingreso: "2023-05-16",
    fecha_entrega: null,
    costo_estimado: 40,
    tecnico_asignado: null,
  },
  {
    id: "ORD-007",
    cliente: "Roberto Díaz",
    dispositivo: "OnePlus 9",
    problema: "Conector de carga",
    estado: "en_proceso",
    fecha_ingreso: "2023-05-15",
    fecha_entrega: null,
    costo_estimado: 55,
    tecnico_asignado: "Carlos Ruiz",
  },
  {
    id: "ORD-008",
    cliente: "Elena Torres",
    dispositivo: "Samsung A52",
    problema: "Botones físicos",
    estado: "finalizado",
    fecha_ingreso: "2023-05-14",
    fecha_entrega: "2023-05-17",
    costo_estimado: 30,
    tecnico_asignado: "Laura Méndez",
  },
]

// Función para traducir el estado
function traducirEstado(estado: string) {
  const traducciones: Record<string, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
  }
  return traducciones[estado] || estado
}

// Función para determinar la variante del badge según el estado
function getVariantForEstado(estado: string) {
  const variantes: Record<string, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
  }
  return variantes[estado] || "default"
}

export default function OrdenesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  // Filtrar órdenes según búsqueda y estado
  const ordenesFiltradas = ordenes.filter((orden) => {
    const matchesSearch =
      orden.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orden.dispositivo.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEstado = filtroEstado === "todos" || orden.estado === filtroEstado

    return matchesSearch && matchesEstado
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
        <Button asChild>
          <Link href="/dashboard/ordenes/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

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
          </SelectContent>
        </Select>
      </div>

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
                    No se encontraron órdenes que coincidan con los criterios de búsqueda.
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
                      <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{orden.fecha_ingreso}</TableCell>
                    <TableCell className="hidden lg:table-cell">{orden.tecnico_asignado || "Sin asignar"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/ordenes/${orden.id}`}>Ver detalles</Link>
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

