"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"

const categorias = ["Repuestos", "Accesorios", "Cables", "Audio", "Baterías"]

export default function NuevoProductoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    cantidad: "",
    proveedor_id: "",
    descripcion: ""
  })
  const [proveedores, setProveedores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener proveedores desde Supabase
  useEffect(() => {
    const fetchProveedores = async () => {
      const { data, error } = await supabase.from("proveedores").select("id, nombre")
      if (!error) setProveedores(data || [])
    }
    fetchProveedores()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Obtener empresa_id del usuario actual
      const { data: usuario } = await supabase.from("usuarios").select("empresa_id").eq("id", (await supabase.auth.getUser()).data.user?.id).single()

      if (!usuario) throw new Error("No se pudo obtener la empresa del usuario")

      const { error } = await supabase.from("inventario").insert([
        {
          nombre: formData.nombre,
          categoria: formData.categoria,
          precio: parseFloat(formData.precio),
          cantidad: parseInt(formData.cantidad),
          proveedor_id: formData.proveedor_id || null,
          descripcion: formData.descripcion,
          empresa_id: usuario.empresa_id
        }
      ])

      if (error) throw error
      alert("Producto creado exitosamente")
      router.push("/dashboard/inventario")
    } catch (error: any) {
      console.error("Error al crear el producto:", error.message)
      alert("Error al crear el producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/inventario">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Producto</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
            <CardDescription>Completa los datos del nuevo producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)} required>
                <SelectTrigger id="categoria">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="precio">Precio</Label>
              <Input id="precio" name="precio" type="number" min="0" step="0.01" value={formData.precio} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input id="cantidad" name="cantidad" type="number" min="0" value={formData.cantidad} onChange={handleChange} required />
            </div>

            <div>
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select value={formData.proveedor_id} onValueChange={(value) => handleSelectChange("proveedor_id", value)}>
                <SelectTrigger id="proveedor">
                  <SelectValue placeholder="Selecciona un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((prov) => (
                    <SelectItem key={prov.id} value={prov.id}>{prov.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/inventario">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar Producto"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
