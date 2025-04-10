"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"
import { getCurrentUserEmpresa } from "@/lib/empresa-utils"

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    rol: "",
    telefono: "",
    correo: "",
    direccion: "",
    fecha_contratacion: "",
    notas: "",
  })
  const [mostrarAcceso, setMostrarAcceso] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const empresa_id = await getCurrentUserEmpresa()

      const res = await fetch("/api/usuarios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, empresa_id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al crear el usuario")

      setMostrarAcceso(true)
    } catch (error: any) {
      console.error("Error al crear el usuario:", error.message)
      alert(`Error: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Usuario</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>Ingresa los datos del nuevo usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
              <Label htmlFor="rol">Rol</Label>
              <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)} required>
                <SelectTrigger id="rol">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>

              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input id="correo" name="correo" type="email" value={formData.correo} onChange={handleChange} required />
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
              <Label htmlFor="fecha_contratacion">Fecha de Contratación</Label>
              <Input id="fecha_contratacion" name="fecha_contratacion" type="date" value={formData.fecha_contratacion} onChange={handleChange} required />
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} rows={3} />
            </div>

            {mostrarAcceso && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Usuario registrado correctamente.</strong></p>
                <p>📧 <strong>Correo:</strong> {formData.correo}</p>
                <p>🔗 <strong>Registro:</strong> Comparte este enlace: <br />
                  <code>http://localhost:3000/auth/registro-empleado</code>
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/empleados">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
