"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getCurrentUserEmpresa } from "@/lib/empresa-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Phone, Mail } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function EmpleadosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmpleados = async () => {
      setLoading(true)
      const empresa_id = await getCurrentUserEmpresa()

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, rol, telefono, correo, fecha_contratacion, estado, direccion")
        .eq("empresa_id", empresa_id)
        .neq("rol", "admin")
        .order("fecha_contratacion", { ascending: false })

      if (error) {
        console.error("Error al cargar empleados:", error)
      } else {
        setEmpleados(data || [])
      }

      setLoading(false)
    }

    fetchEmpleados()
  }, [])

  const empleadosFiltrados = empleados.filter((empleado) =>
    [empleado.nombre, empleado.rol, empleado.telefono, empleado.correo, empleado.id]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-6">Cargando empleados...</div>

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
            placeholder="Buscar por nombre, rol, teléfono o correo..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Empleados</CardTitle>
          <CardDescription>Gestiona la información de tu equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Contacto</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha Contratación</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empleadosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No se encontraron empleados.
                  </TableCell>
                </TableRow>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell>
                      <div className="font-medium">{empleado.nombre}</div>
                      <div className="text-sm text-muted-foreground">{empleado.id}</div>
                    </TableCell>
                    <TableCell>{empleado.rol}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1 text-sm">
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
                    <TableCell className="hidden lg:table-cell">
                      {empleado.fecha_contratacion || "—"}
                    </TableCell>
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
