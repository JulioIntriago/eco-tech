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

// Datos de ejemplo para proveedores
const proveedores = [
  {
    id: "PROV-001",
    nombre: "TechParts Inc.",
    tipo: "Repuestos",
    telefono: "555-123-4567",
    correo: "contacto@techparts.com",
    direccion: "Calle Industrial 123, Ciudad",
    productos: 15,
    ultima_compra: "2023-05-10",
    estado: "activo",
  },
  {
    id: "PROV-002",
    nombre: "BatteryPlus",
    tipo: "Baterías",
    telefono: "555-987-6543",
    correo: "ventas@batteryplus.com",
    direccion: "Av. Tecnológica 456, Ciudad",
    productos: 8,
    ultima_compra: "2023-05-05",
    estado: "activo",
  },
  {
    id: "PROV-003",
    nombre: "ElectroSupply",
    tipo: "Accesorios",
    telefono: "555-456-7890",
    correo: "info@electrosupply.com",
    direccion: "Blvd. Electrónico 789, Ciudad",
    productos: 22,
    ultima_compra: "2023-04-28",
    estado: "activo",
  },
  {
    id: "PROV-004",
    nombre: "ScreenGuard",
    tipo: "Protectores",
    telefono: "555-234-5678",
    correo: "ventas@screenguard.com",
    direccion: "Calle Protección 234, Ciudad",
    productos: 5,
    ultima_compra: "2023-04-15",
    estado: "inactivo",
  },
  {
    id: "PROV-005",
    nombre: "CaseMakers",
    tipo: "Fundas",
    telefono: "555-876-5432",
    correo: "info@casemakers.com",
    direccion: "Av. Diseño 567, Ciudad",
    productos: 12,
    ultima_compra: "2023-05-12",
    estado: "activo",
  },
  {
    id: "PROV-006",
    nombre: "SoundTech",
    tipo: "Audio",
    telefono: "555-345-6789",
    correo: "contacto@soundtech.com",
    direccion: "Calle Sonido 890, Ciudad",
    productos: 7,
    ultima_compra: "2023-05-08",
    estado: "activo",
  },
]

export default function ProveedoresPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filtrar proveedores según búsqueda
  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proveedor.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proveedor.telefono.includes(searchQuery) ||
      proveedor.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proveedor.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Proveedores</h2>
        <Button asChild>
          <Link href="/dashboard/proveedores/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, tipo, teléfono, correo o ID..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Proveedores</CardTitle>
          <CardDescription>Gestiona la información de tus proveedores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Contacto</TableHead>
                <TableHead className="hidden lg:table-cell">Última Compra</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron proveedores que coincidan con los criterios de búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                proveedoresFiltrados.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell>
                      <div className="font-medium">{proveedor.nombre}</div>
                      <div className="text-sm text-muted-foreground">{proveedor.id}</div>
                    </TableCell>
                    <TableCell>{proveedor.tipo}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                          {proveedor.telefono}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          {proveedor.correo}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{proveedor.ultima_compra}</TableCell>
                    <TableCell className="text-center">{proveedor.productos}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={proveedor.estado === "activo" ? "success" : "secondary"}>
                        {proveedor.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/proveedores/${proveedor.id}`}>Ver detalles</Link>
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

