import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const inventoryItems = [
  {
    id: "INV-001",
    nombre: "Pantalla iPhone 12",
    categoria: "Repuestos",
    precio: 120,
    cantidad: 5,
    estado: "Normal",
  },
  {
    id: "INV-002",
    nombre: "Batería Samsung S21",
    categoria: "Repuestos",
    precio: 45,
    cantidad: 8,
    estado: "Normal",
  },
  {
    id: "INV-003",
    nombre: "Cargador USB-C",
    categoria: "Accesorios",
    precio: 15,
    cantidad: 2,
    estado: "Bajo",
  },
  {
    id: "INV-004",
    nombre: "Protector Pantalla",
    categoria: "Accesorios",
    precio: 10,
    cantidad: 25,
    estado: "Normal",
  },
  {
    id: "INV-005",
    nombre: "Funda iPhone 12",
    categoria: "Accesorios",
    precio: 18,
    cantidad: 3,
    estado: "Bajo",
  },
]

export function InventoryStatus() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Estado del Inventario</CardTitle>
          <CardDescription>Productos con stock bajo o agotados</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver todo
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nombre}</TableCell>
                <TableCell className="hidden md:table-cell">{item.categoria}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.cantidad}
                    {item.estado === "Bajo" && (
                      <Badge variant="destructive" className="ml-2">
                        Stock Bajo
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">${item.precio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

