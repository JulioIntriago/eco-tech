"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para clientes y técnicos
const clientes = [
  { id: "CLI-001", nombre: "Juan Pérez" },
  { id: "CLI-002", nombre: "María López" },
  { id: "CLI-003", nombre: "Carlos Ruiz" },
  { id: "CLI-004", nombre: "Ana Gómez" },
  { id: "CLI-005", nombre: "Pedro Sánchez" },
]

const tecnicos = [
  { id: "TEC-001", nombre: "Carlos Ruiz" },
  { id: "TEC-002", nombre: "Laura Méndez" },
  { id: "TEC-003", nombre: "Roberto Díaz" },
]

export default function NuevaOrdenPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    cliente_id: "",
    dispositivo: "",
    modelo: "",
    problema: "",
    costo_estimado: "",
    tecnico_asignado: "",
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
      // Aquí iría la lógica para guardar en Supabase
      console.log("Datos de la orden:", formData)

      // Simular tiempo de carga
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redireccionar a la lista de órdenes
      router.push("/dashboard/ordenes")
    } catch (error) {
      console.error("Error al crear la orden:", error)
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
            <div className="space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dispositivo">Tipo de Dispositivo</Label>
                  <Input
                    id="dispositivo"
                    name="dispositivo"
                    placeholder="iPhone, Samsung, etc."
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
                    placeholder="iPhone 12, Galaxy S21, etc."
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problema">Descripción del Problema</Label>
                <Textarea
                  id="problema"
                  name="problema"
                  placeholder="Detalla el problema que presenta el dispositivo"
                  value={formData.problema}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="costo_estimado">Costo Estimado ($)</Label>
                  <Input
                    id="costo_estimado"
                    name="costo_estimado"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.costo_estimado}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tecnico_asignado">Técnico Asignado</Label>
                  <Select
                    value={formData.tecnico_asignado}
                    onValueChange={(value) => handleSelectChange("tecnico_asignado", value)}
                  >
                    <SelectTrigger id="tecnico_asignado">
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

              <div className="space-y-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  placeholder="Información adicional relevante"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/ordenes">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Orden"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

