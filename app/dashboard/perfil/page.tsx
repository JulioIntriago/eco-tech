"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function PerfilPage() {
  const [perfil, setPerfil] = useState({ nombre: "", correo: "", rol: "" })
  const [loading, setLoading] = useState(false)

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("nombre, correo, rol")
          .eq("id", user.id)
          .single()
        if (data) setPerfil(data)
      }
    }

    cargarPerfil()
  }, [])

  // Cambios en el input nombre
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPerfil((prev) => ({ ...prev, [name]: value }))
  }

  // Guardar cambios
  const actualizarPerfil = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("usuarios")
      .update({ nombre: perfil.nombre }) // Solo el nombre es editable por ahora
      .eq("id", user.id)

    if (error) {
      alert("Error al actualizar el perfil")
      console.error(error)
    } else {
      alert("Perfil actualizado correctamente")
    }

    setLoading(false)
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input
              name="nombre"
              value={perfil.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <Label>Correo</Label>
            <Input value={perfil.correo} readOnly />
          </div>
          <div>
            <Label>Rol</Label>
            <Input value={perfil.rol} readOnly />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={actualizarPerfil} disabled={loading}>
            {loading ? "Guardando..." : "Actualizar Perfil"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
