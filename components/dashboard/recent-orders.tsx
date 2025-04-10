"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { getCurrentUserEmpresa } from "@/lib/empresa-utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function RecentOrders() {
  const [ordenes, setOrdenes] = useState<any[]>([])

  useEffect(() => {
    const fetchOrdenes = async () => {

      const empresa_id = await getCurrentUserEmpresa() // 👈 esta es la línea correcta

      const { data, error } = await supabase
  .from("ordenes")
  .select(`
    id,
    estado,
    dispositivo,
    cliente:cliente_id (nombre)
  `)
  
  .eq("empresa_id", empresa_id) // 👈 Filtro por empresa
  .order("fecha_ingreso", { ascending: false })
  .limit(5)

    


      if (error) {
        console.error("Error al cargar órdenes recientes:", error)
      } else {
        setOrdenes(data || [])
      }
    }

    fetchOrdenes()
  }, [])

  const getEstadoVariant = (estado: string) => {
    if (["Finalizado", "Entregado"].includes(estado)) return "success"
    if (estado === "En proceso") return "default"
    return "secondary"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Órdenes Recientes</CardTitle>
          <CardDescription>Últimas 5 órdenes de reparación registradas</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard/ordenes">Ver todas</a>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Dispositivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenes.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell className="font-medium">{orden.id.slice(0, 8)}</TableCell>
                <TableCell>{orden.cliente?.nombre || "—"}</TableCell>
                <TableCell className="hidden md:table-cell">{orden.dispositivo || "—"}</TableCell>
                <TableCell>
                  <Badge variant={getEstadoVariant(orden.estado)}>{orden.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => alert("Ver detalles")}>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert("Editar orden")}>Editar orden</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert("Actualizar estado")}>Actualizar estado</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
