"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegistroEmpleadoPage() {
  const router = useRouter()
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // ✅ 1. Verificar que exista una invitación pendiente con este correo
      const { data: invitacion, error: errorBuscar } = await supabase
        .from("invitaciones")
        .select("*")
        .eq("correo", correo)
        .eq("estado", "pendiente")
        .maybeSingle()

      if (errorBuscar) throw errorBuscar
      if (!invitacion) {
        setError("Este correo no tiene invitación pendiente o ya fue registrado.")
        return
      }

      // ✅ 2. Crear usuario con Supabase Auth
      const { data, error: errorAuth } = await supabase.auth.signUp({
        email: correo,
        password,
      })

      if (errorAuth || !data?.user?.id) throw errorAuth || new Error("No se pudo crear el usuario")

      // ✅ 3. Crear el registro en la tabla `usuarios`
      const { error: errorInsert } = await supabase.from("usuarios").insert([
        {
          id: data.user.id,
          correo,
          nombre,
          rol: invitacion.rol,
          empresa_id: invitacion.empresa_id,
          estado: "activo",
        },
      ])

      if (errorInsert) throw errorInsert

      // ✅ 4. Actualizar el estado de la invitación
      await supabase
        .from("invitaciones")
        .update({ estado: "usada" })
        .eq("id", invitacion.id)

      alert("Cuenta creada correctamente. Revisa tu correo para verificar tu cuenta.")
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Error en registro:", error.message)
      setError(error.message || "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro de Empleado</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="correo">Correo corporativo</Label>
              <Input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
