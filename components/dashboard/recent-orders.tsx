import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const recentOrders = [
  {
    id: "ORD-001",
    cliente: "Juan Pérez",
    dispositivo: "iPhone 12",
    problema: "Pantalla rota",
    estado: "En proceso",
    fecha: "2023-05-15",
  },
  {
    id: "ORD-002",
    cliente: "María López",
    dispositivo: "Samsung S21",
    problema: "Batería",
    estado: "Pendiente",
    fecha: "2023-05-14",
  },
  {
    id: "ORD-003",
    cliente: "Carlos Ruiz",
    dispositivo: "Xiaomi Mi 11",
    problema: "No enciende",
    estado: "Finalizado",
    fecha: "2023-05-13",
  },
  {
    id: "ORD-004",
    cliente: "Ana Gómez",
    dispositivo: "Motorola G9",
    problema: "Micrófono",
    estado: "Entregado",
    fecha: "2023-05-12",
  },
  {
    id: "ORD-005",
    cliente: "Pedro Sánchez",
    dispositivo: "iPhone 11",
    problema: "Cámara",
    estado: "En proceso",
    fecha: "2023-05-11",
  },
]

export function RecentOrders() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Órdenes Recientes</CardTitle>
          <CardDescription>Últimas 5 órdenes de reparación registradas</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver todas
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
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.cliente}</TableCell>
                <TableCell className="hidden md:table-cell">{order.dispositivo}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.estado === "Finalizado" || order.estado === "Entregado"
                        ? "success"
                        : order.estado === "En proceso"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {order.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar orden</DropdownMenuItem>
                      <DropdownMenuItem>Actualizar estado</DropdownMenuItem>
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

