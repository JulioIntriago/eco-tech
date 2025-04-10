"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Phone, Mail } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function ProveedoresPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [proveedores, setProveedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const fetchProveedores = async () => {
      const { data: proveedoresBase, error } = await supabase
        .from("proveedores")
        .select("*")
        .order("nombre", { ascending: true })

      if (error) {
        console.error("Error al cargar proveedores:", error)
        return
      }

      // Enriquecer con productos y última compra
      const proveedoresConExtras = await Promise.all(
        (proveedoresBase || []).map(async (proveedor) => {
          // Cantidad de productos
          const { count } = await supabase
            .from("inventario")
            .select("*", { count: "exact", head: true })
            .eq("proveedor_id", proveedor.id)

          // Última compra
          const { data: ultimaCompra } = await supabase
            .from("inventario")
            .select("creado_en")
            .eq("proveedor_id", proveedor.id)
            .order("creado_en", { ascending: false })
            .limit(1)
            .maybeSingle()

          return {
            ...proveedor,
            productos: count ?? 0,
            ultima_compra: ultimaCompra?.creado_en
              ? new Date(ultimaCompra.creado_en).toLocaleDateString()
              : null,
          }
        })
      )

      setProveedores(proveedoresConExtras)
      setLoading(false)
    }

    fetchProveedores()
  }, [])

  const proveedoresFiltrados = proveedores.filter(
    (proveedor) =>
      proveedor.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proveedor.tipo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proveedor.telefono?.includes(searchQuery) ||
      proveedor.correo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proveedor.id?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) return null

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Cargando proveedores...
                  </TableCell>
                </TableRow>
              ) : proveedoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No se encontraron proveedores.
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
                    <TableCell className="hidden lg:table-cell">
                      {proveedor.ultima_compra || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {proveedor.productos ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={proveedor.estado === "activo" ? "success" : "secondary"}>
                        {proveedor.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/proveedores/${proveedor.id}`}>
                          Ver detalles
                        </Link>
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
