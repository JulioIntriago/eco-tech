"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, DollarSign, Package, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function DashboardCards() {
  const [ordenesActivas, setOrdenesActivas] = useState(0)
  const [ventasMes, setVentasMes] = useState(0)
  const [productosStock, setProductosStock] = useState(0)
  const [clientesNuevos, setClientesNuevos] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: ordenes } = await supabase
        .from("ordenes")
        .select("id", { count: "exact", head: true })
        .eq("estado", "en proceso")

      const { data: ventas } = await supabase
        .from("ventas")
        .select("total, fecha")

      const { data: productos } = await supabase
        .from("inventario")
        .select("cantidad")

      const { data: clientes } = await supabase
        .from("clientes")
        .select("creado_en")

      const mesActual = new Date().getMonth()

      const totalVentasMes = ventas
        ?.filter((v) => new Date(v.fecha).getMonth() === mesActual)
        .reduce((acc, v) => acc + parseFloat(v.total), 0) || 0

      const totalStock = productos?.reduce((acc, p) => acc + p.cantidad, 0) || 0
      const nuevosClientes = clientes?.filter((c) => new Date(c.creado_en).getMonth() === mesActual).length || 0

      setOrdenesActivas(ordenes?.length || 0)
      setVentasMes(totalVentasMes)
      setProductosStock(totalStock)
      setClientesNuevos(nuevosClientes)
    }

    fetchData()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ordenesActivas}</div>
          <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${ventasMes.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos en Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productosStock}</div>
          <p className="text-xs text-muted-foreground">8 productos con stock bajo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientesNuevos}</div>
          <p className="text-xs text-muted-foreground">+2% desde el mes pasado</p>
        </CardContent>
      </Card>
    </div>
  )
}
