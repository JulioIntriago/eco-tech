"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verificar si el empleado ya existe por correo
      const { data: existente, error: errorBuscar } = await supabase
        .from("empleados")
        .select("id")
        .eq("correo", formData.correo)
        .maybeSingle()

      if (errorBuscar) throw errorBuscar

      if (existente) {
        alert("Ya existe un empleado con este correo.")
        setLoading(false)
        return
      }

      // Insertar empleado
      const { data: empleadoData, error: errorInsertar } = await supabase
        .from("empleados")
        .insert({
          nombre: formData.nombre,
          rol: formData.rol.toLowerCase(),
          telefono: formData.telefono,
          correo: formData.correo,
          direccion: formData.direccion,
          fecha_contratacion: formData.fecha_contratacion,
          estado: "activo",
          notas: formData.notas,
        })
        .select()
        .single()

      if (errorInsertar) throw errorInsertar

      // Generar token de invitación
      const token = crypto.randomUUID()

      // Insertar invitación
      await supabase.from("invitaciones").insert({
        empleado_id: empleadoData.id,
        correo: formData.correo,
        nombre: formData.nombre, // ✅ campo requerido
        token,
        estado: "pendiente",
      })
      


      // Notificación y redirección
      alert("Empleado creado y invitación enviada con éxito.")
      router.push("/dashboard/empleados")
    } catch (error: any) {
      console.error("Error al crear el empleado:", error?.message || error)
      alert(`Error al crear el empleado: ${error?.message || "Error desconocido"}`)
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
        <h2 className="text-2xl font-bold tracking-tight">Nuevo Empleado</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Empleado</CardTitle>
            <CardDescription>Ingresa los datos del nuevo empleado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" name="nombre" placeholder="Nombre y apellidos" value={formData.nombre} onChange={handleChange} required />

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
              <Input id="telefono" name="telefono" placeholder="Número de teléfono" value={formData.telefono} onChange={handleChange} required />

              <Label htmlFor="correo">Correo Electrónico</Label>
              <Input id="correo" name="correo" type="email" placeholder="correo@ejemplo.com" value={formData.correo} onChange={handleChange} required />

              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" name="direccion" placeholder="Dirección completa" value={formData.direccion} onChange={handleChange} />

              <Label htmlFor="fecha_contratacion">Fecha de Contratación</Label>
              <Input id="fecha_contratacion" name="fecha_contratacion" type="date" value={formData.fecha_contratacion} onChange={handleChange} required />

              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea id="notas" name="notas" placeholder="Información adicional relevante" value={formData.notas} onChange={handleChange} rows={3} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/empleados">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Empleado"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
