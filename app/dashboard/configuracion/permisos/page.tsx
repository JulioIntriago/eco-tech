"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Tipos de permisos válidos
type TipoPermiso = "ver" | "crear" | "editar" | "eliminar"

// Estructura de permisos por módulo
type PermisosPorModulo = {
  [moduloId: string]: TipoPermiso[]
}

// Estructura de permisos por rol
type PermisosPorRol = {
  [rolId: string]: PermisosPorModulo
}

// Lista de roles del sistema
const roles = [
  { id: "admin", nombre: "Administrador" },
  { id: "tecnico", nombre: "Técnico" },
  { id: "vendedor", nombre: "Vendedor" },
  { id: "visualizador", nombre: "Visualizador" },
]

// Módulos del sistema
const modulos = [
  { id: "dashboard", nombre: "Dashboard" },
  { id: "ordenes", nombre: "Órdenes de Trabajo" },
  { id: "inventario", nombre: "Inventario" },
  { id: "ventas", nombre: "Punto de Venta" },
  { id: "clientes", nombre: "Clientes" },
  { id: "empleados", nombre: "Empleados" },
  { id: "proveedores", nombre: "Proveedores" },
  { id: "notificaciones", nombre: "Notificaciones" },
  { id: "configuracion", nombre: "Configuración" },
]

// Tipos de acciones permitidas
const tiposPermiso: { id: TipoPermiso; nombre: string }[] = [
  { id: "ver", nombre: "Ver" },
  { id: "crear", nombre: "Crear" },
  { id: "editar", nombre: "Editar" },
  { id: "eliminar", nombre: "Eliminar" },
]

// Permisos iniciales por cada rol
const permisosIniciales: PermisosPorRol = {
  admin: {
    dashboard: ["ver", "crear", "editar", "eliminar"],
    ordenes: ["ver", "crear", "editar", "eliminar"],
    inventario: ["ver", "crear", "editar", "eliminar"],
    ventas: ["ver", "crear", "editar", "eliminar"],
    clientes: ["ver", "crear", "editar", "eliminar"],
    empleados: ["ver", "crear", "editar", "eliminar"],
    proveedores: ["ver", "crear", "editar", "eliminar"],
    notificaciones: ["ver", "crear", "editar", "eliminar"],
    configuracion: ["ver", "crear", "editar", "eliminar"],
  },
  tecnico: {
    dashboard: ["ver"],
    ordenes: ["ver", "crear", "editar"],
    inventario: ["ver", "editar"],
    ventas: [],
    clientes: ["ver"],
    empleados: [],
    proveedores: ["ver"],
    notificaciones: ["ver"],
    configuracion: [],
  },
  vendedor: {
    dashboard: ["ver"],
    ordenes: ["ver", "crear"],
    inventario: ["ver"],
    ventas: ["ver", "crear", "editar"],
    clientes: ["ver", "crear", "editar"],
    empleados: [],
    proveedores: ["ver"],
    notificaciones: ["ver"],
    configuracion: [],
  },
  visualizador: {
    dashboard: ["ver"],
    ordenes: ["ver"],
    inventario: ["ver"],
    ventas: ["ver"],
    clientes: ["ver"],
    empleados: ["ver"],
    proveedores: ["ver"],
    notificaciones: ["ver"],
    configuracion: [],
  },
}

export default function PermisosPage() {
  const [rolSeleccionado, setRolSeleccionado] = useState<keyof PermisosPorRol>("admin")
  const [permisos, setPermisos] = useState<PermisosPorRol>(permisosIniciales)
  const [loading, setLoading] = useState(false)

  // Verifica si un permiso está habilitado para un módulo en un rol
  const tienePermiso = (modulo: string, permiso: TipoPermiso): boolean => {
    return permisos[rolSeleccionado]?.[modulo]?.includes(permiso) || false
  }

  // Alterna un permiso (agrega o quita) para el rol actual
  const togglePermiso = (modulo: string, permiso: TipoPermiso) => {
    setPermisos((prev) => {
      const actualizado = { ...prev }
      const actuales = actualizado[rolSeleccionado][modulo] || []

      if (actuales.includes(permiso)) {
        actualizado[rolSeleccionado][modulo] = actuales.filter((p) => p !== permiso)
      } else {
        actualizado[rolSeleccionado][modulo] = [...actuales, permiso]
      }

      return actualizado
    })
  }

  // Simula el guardado de permisos (aquí iría el push a Supabase)
  const guardarCambios = async () => {
    setLoading(true)
    try {
      console.log("Permisos actualizados:", permisos)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Permisos actualizados",
        description: "Los permisos han sido actualizados correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los permisos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/configuracion">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Permisos</h2>
        </div>
        <Button onClick={guardarCambios} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {/* Selección de roles */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Roles del Sistema</CardTitle>
            <CardDescription>Selecciona un rol para configurar sus permisos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.map((rol) => (
                <Button
                  key={rol.id}
                  variant={rolSeleccionado === rol.id ? "default" : "outline"}
                  onClick={() => setRolSeleccionado(rol.id as keyof PermisosPorRol)}
                >
                  {rol.nombre}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de permisos por módulo */}
      <Card>
        <CardHeader>
          <CardTitle>
            Permisos para: {roles.find((r) => r.id === rolSeleccionado)?.nombre}
          </CardTitle>
          <CardDescription>
            Configura los permisos para cada módulo del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                {tiposPermiso.map((tipo) => (
                  <TableHead key={tipo.id} className="text-center">
                    {tipo.nombre}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modulos.map((modulo) => (
                <TableRow key={modulo.id}>
                  <TableCell className="font-medium">{modulo.nombre}</TableCell>
                  {tiposPermiso.map((tipo) => (
                    <TableCell key={tipo.id} className="text-center">
                      <Checkbox
                        checked={tienePermiso(modulo.id, tipo.id)}
                        onCheckedChange={() => togglePermiso(modulo.id, tipo.id)}
                        disabled={rolSeleccionado === "admin" && modulo.id === "configuracion" && tipo.id === "ver"}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
