"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"

// Tipos para los clientes y técnicos
type Cliente = {
  id: string
  nombre: string
}

type Tecnico = {
  id: string
  nombre: string
}

export default function NuevaOrdenPage() {
  const router = useRouter()

  // Estado para el formulario
  const [formData, setFormData] = useState({
    cliente_id: "",
    dispositivo: "",
    modelo: "",
    problema: "",
    costo_estimado: "",
    tecnico_id: "",
    notas: "",
  })

  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([])

  // Obtener clientes y técnicos desde Supabase al cargar
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Obtener clientes
        const { data: clientesData, error: errorClientes } = await supabase
          .from("clientes")
          .select("id, nombre")

        if (errorClientes) throw errorClientes
        setClientes(clientesData || [])

        // Obtener usuarios con rol técnico
        const { data: tecnicosData, error: errorTecnicos } = await supabase
          .from("empleados")
          .select("id, nombre")
          .eq("rol", "tecnico")

        if (errorTecnicos) throw errorTecnicos
        setTecnicos(tecnicosData || [])
      } catch (error: any) {
        console.error("Error al cargar los datos:", error.message)
      }
    }

    fetchDatos()
  }, [])

  // Manejar cambios en inputs y textarea
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en selects personalizados
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Validar Formulario
  const validarFormulario = () => {
    if (!formData.cliente_id) return "Selecciona un cliente."
    if (!formData.dispositivo) return "El tipo de dispositivo es obligatorio."
    if (!formData.modelo) return "El modelo es obligatorio."
    if (!formData.problema) return "La descripción del problema es obligatoria."
    if (!formData.costo_estimado || isNaN(Number(formData.costo_estimado))) return "Costo estimado inválido."
    return null
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      alert(errorValidacion)
      setLoading(false)
      return
    }

    try {
      // Insertar orden en la tabla ordenes
      const { error } = await supabase.from("ordenes").insert({
        cliente_id: formData.cliente_id,
        dispositivo: formData.dispositivo,
        modelo: formData.modelo,
        problema: formData.problema,
        costo_estimado: parseFloat(formData.costo_estimado),
        tecnico_id: formData.tecnico_id || null,
        notas: formData.notas,
        estado: "pendiente", // Estado inicial por defecto
      })

      if (error) throw error

      alert("Orden creada con éxito.")
      router.push("/dashboard/ordenes")
    } catch (error: any) {
      console.error("Error al crear la orden:", error.message || error)
      alert(`Error al crear la orden: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/ordenes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Orden de Trabajo</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información de la Orden</CardTitle>
            <CardDescription>Ingresa los detalles de la nueva orden de reparación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cliente */}
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => handleSelectChange("cliente_id", value)}
                required
              >
                <SelectTrigger id="cliente_id">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dispositivo y Modelo */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dispositivo">Tipo de Dispositivo</Label>
                <Input
                  id="dispositivo"
                  name="dispositivo"
                  placeholder="Ej. iPhone, Samsung, etc."
                  value={formData.dispositivo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  name="modelo"
                  placeholder="Ej. iPhone 12, Galaxy S21"
                  value={formData.modelo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Problema */}
            <div className="space-y-2">
              <Label htmlFor="problema">Descripción del Problema</Label>
              <Textarea
                id="problema"
                name="problema"
                placeholder="Describe el problema del dispositivo"
                value={formData.problema}
                onChange={handleChange}
                required
              />
            </div>

            {/* Costo y Técnico */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="costo_estimado">Costo Estimado ($)</Label>
                <Input
                  id="costo_estimado"
                  name="costo_estimado"
                  type="number"
                  placeholder="0.00"
                  value={formData.costo_estimado}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tecnico_id">Técnico Asignado</Label>
                <Select
                  value={formData.tecnico_id}
                  onValueChange={(value) => handleSelectChange("tecnico_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un técnico (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {tecnicos.map((tecnico) => (
                      <SelectItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar Orden"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
