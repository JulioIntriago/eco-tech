"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Phone, Mail } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

// Datos de ejemplo para empleados
const empleados = [
  {
    id: "EMP-001",
    nombre: "Carlos Ruiz",
    cargo: "Técnico",
    telefono: "555-123-4567",
    correo: "carlos.ruiz@ecotech.com",
    fecha_contratacion: "2022-01-15",
    ordenes_asignadas: 5,
    estado: "activo",
  },
  {
    id: "EMP-002",
    nombre: "Laura Méndez",
    cargo: "Técnico",
    telefono: "555-987-6543",
    correo: "laura.mendez@ecotech.com",
    fecha_contratacion: "2022-03-10",
    ordenes_asignadas: 3,
    estado: "activo",
  },
  {
    id: "EMP-003",
    nombre: "Roberto Díaz",
    cargo: "Técnico",
    telefono: "555-456-7890",
    correo: "roberto.diaz@ecotech.com",
    fecha_contratacion: "2022-05-20",
    ordenes_asignadas: 0,
    estado: "inactivo",
  },
  {
    id: "EMP-004",
    nombre: "Ana Gómez",
    cargo: "Vendedor",
    telefono: "555-234-5678",
    correo: "ana.gomez@ecotech.com",
    fecha_contratacion: "2022-02-15",
    ordenes_asignadas: 0,
    estado: "activo",
  },
  {
    id: "EMP-005",
    nombre: "Miguel Torres",
    cargo: "Vendedor",
    telefono: "555-876-5432",
    correo: "miguel.torres@ecotech.com",
    fecha_contratacion: "2022-04-05",
    ordenes_asignadas: 0,
    estado: "activo",
  },
  {
    id: "EMP-006",
    nombre: "Lucía Martínez",
    cargo: "Administrador",
    telefono: "555-345-6789",
    correo: "lucia.martinez@ecotech.com",
    fecha_contratacion: "2021-11-10",
    ordenes_asignadas: 0,
    estado: "activo",
  },
]

export default function EmpleadosPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrar empleados según búsqueda
  const empleadosFiltrados = empleados.filter(
    (empleado) =>
      empleado.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.telefono.includes(searchQuery) ||
      empleado.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empleado.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Empleados</h2>
        <Button asChild>
          <Link href="/dashboard/empleados/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, cargo, teléfono, correo o ID..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Empleados</CardTitle>
          <CardDescription>Gestiona la información de tu equipo de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="hidden md:table-cell">Contacto</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha Contratación</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleadosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No se encontraron empleados que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell>
                      <div className="font-medium">{empleado.nombre}</div>
                      <div className="text-sm text-muted-foreground">{empleado.id}</div>
                    </TableCell>
                    <TableCell>{empleado.cargo}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                          {empleado.telefono}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          {empleado.correo}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{empleado.fecha_contratacion}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={empleado.estado === "activo" ? "success" : "secondary"}>
                        {empleado.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/empleados/${empleado.id}`}>Ver detalles</Link>
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

