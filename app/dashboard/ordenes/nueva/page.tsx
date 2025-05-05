"use client"

import { useEffect, useState } from "react"
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
import {
  ArrowLeft,
  Smartphone,
  PenToolIcon as Tool,
  Calendar,
  DollarSign,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { supabase } from "@/lib/supabase"
import { getCurrentUserEmpresa } from "@/lib/empresa-utils"

const tiposDispositivo = [
  "iPhone",
  "Samsung Galaxy",
  "Xiaomi",
  "Huawei",
  "Motorola",
  "OnePlus",
  "Google Pixel",
  "LG",
  "Sony",
  "Otro",
]

export default function NuevaOrdenPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [clienteNuevo, setClienteNuevo] = useState(false)

  const [formData, setFormData] = useState({
    cliente_id: "",
    tipo_dispositivo: "",
    dispositivo: "",
    modelo: "",
    imei: "",
    problema: "",
    condiciones_entrega: "",
    costo_estimado: "",
    anticipo: "0",
    total: "",
    metodo_pago: "",
    pagado: false,
    garantia: false,
    tecnico_id: "",
    prioridad: "normal",
    notas: "",
    fecha_entrega: "",
  })

  const [datosClienteNuevo, setDatosClienteNuevo] = useState({
    nombre: "",
    telefono: "",
    correo: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      const empresa_id = await getCurrentUserEmpresa()

      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nombre")
        .eq("empresa_id", empresa_id)

      const { data: tecnicosData } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("empresa_id", empresa_id)
      .eq("rol", "tecnico")
      .eq("estado", "activo");

      setClientes(clientesData || [])
      setTecnicos(tecnicosData || [])
    }

    fetchData()
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleClienteNuevoChange = (e: any) => {
    const { name, value } = e.target
    setDatosClienteNuevo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tipo_dispositivo || !formData.modelo || !formData.problema) {
      toast({ title: "Faltan campos obligatorios", variant: "destructive" })
      return
    }

    if (clienteNuevo && (!datosClienteNuevo.nombre || !datosClienteNuevo.telefono)) {
      toast({
        title: "Completa los datos del nuevo cliente",
        variant: "destructive",
      })
      return
    }

    if (!clienteNuevo && !formData.cliente_id) {
      toast({
        title: "Selecciona un cliente existente",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const empresa_id = await getCurrentUserEmpresa()
      let cliente_id = formData.cliente_id

      if (clienteNuevo) {
        const { data: nuevoCliente, error: errorCliente } = await supabase
          .from("clientes")
          .insert({
            ...datosClienteNuevo,
            empresa_id,
          })
          .select()
          .single()

        if (errorCliente || !nuevoCliente) throw errorCliente
        cliente_id = nuevoCliente.id
      }

      const { error: errorOrden } = await supabase.from("ordenes").insert({
        empresa_id,
        cliente_id,
        tipo_dispositivo: formData.tipo_dispositivo,
        dispositivo: formData.dispositivo || `${formData.tipo_dispositivo} ${formData.modelo}`.trim(),
        modelo: formData.modelo,
        imei: formData.imei,
        problema: formData.problema,
        condiciones_entrega: formData.condiciones_entrega,
        costo_estimado: parseFloat(formData.costo_estimado || "0"),
        anticipo: parseFloat(formData.anticipo || "0"),
        total: parseFloat(formData.total || "0"),
        metodo_pago: formData.metodo_pago,
        pagado: formData.pagado,
        garantia: formData.garantia,
        tecnico_id: formData.tecnico_id || null,
        prioridad: formData.prioridad,
        notas: formData.notas,
        fecha_ingreso: new Date().toISOString(),
        fecha_entrega: formData.fecha_entrega || null,
      })

      if (errorOrden) throw errorOrden

      toast({
        title: "Orden creada",
        description: "Se registró correctamente la orden.",
      })
      router.push("/dashboard/ordenes")
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error al guardar la orden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/ordenes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Orden de Trabajo</h2>
      </div>

      <form onSubmit={handleSubmit}>
  <div className="grid gap-6 md:grid-cols-2">
    {/* CLIENTE */}
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>Selecciona un cliente o registra uno nuevo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cliente_nuevo"
              checked={clienteNuevo}
              onChange={(e) => setClienteNuevo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="cliente_nuevo" className="text-sm font-medium">
              Cliente nuevo
            </label>
          </div>

          {clienteNuevo ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={datosClienteNuevo.nombre}
                  onChange={handleClienteNuevoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={datosClienteNuevo.telefono}
                  onChange={handleClienteNuevoChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correo">Correo (opcional)</Label>
                <Input
                  id="correo"
                  name="correo"
                  value={datosClienteNuevo.correo}
                  onChange={handleClienteNuevoChange}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="cliente_id">Seleccionar Cliente</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => handleSelectChange("cliente_id", value)}
                
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
          )}
        </CardContent>
      </Card>

      {/* DISPOSITIVO */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Dispositivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Dispositivo</Label>
            <Select
              value={formData.tipo_dispositivo}
              onValueChange={(value) => handleSelectChange("tipo_dispositivo", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposDispositivo.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            name="modelo"
            placeholder="Modelo (ej. iPhone 12)"
            value={formData.modelo}
            onChange={handleChange}
            required
          />

          <Input
            name="imei"
            placeholder="IMEI o Serie (opcional)"
            value={formData.imei}
            onChange={handleChange}
          />

          <Textarea
            name="problema"
            placeholder="Describe el problema"
            value={formData.problema}
            onChange={handleChange}
            required
          />

          <Textarea
            name="condiciones_entrega"
            placeholder="Condiciones del equipo al recibirlo"
            value={formData.condiciones_entrega}
            onChange={handleChange}
          />
        </CardContent>
      </Card>
    </div>

    {/* REPARACIÓN + RESUMEN */}
    <div className="space-y-6">
      {/* REPARACIÓN */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Reparación</CardTitle>
          <CardDescription>Información sobre costos y asignación</CardDescription>

        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="costo_estimado"
              type="number"
              placeholder="Costo estimado"
              value={formData.costo_estimado}
              onChange={handleChange}
            />
            
            <Input
              name="anticipo"
              type="number"
              placeholder="Anticipo"
              value={formData.anticipo}
              onChange={handleChange}
            />
            <Input
              name="total"
              type="number"
              placeholder="Total final"
              value={formData.total}
              onChange={handleChange}
            />
            <Input
              name="fecha_entrega"
              type="date"
              value={formData.fecha_entrega}
              onChange={handleChange}
            />
          </div>

       
          {/* TÉCNICO */}
          <div className="space-y-2">
            <Label>Técnico Asignado</Label>
            <Select
              value={formData.tecnico_id}
              onValueChange={(value) => handleSelectChange("tecnico_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un técnico (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PRIORIDAD */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <RadioGroup
              value={formData.prioridad}
              onValueChange={(value) => handleSelectChange("prioridad", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="baja" id="baja" />
                <Label htmlFor="baja">Baja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alta" id="alta" />
                <Label htmlFor="alta">Alta</Label>
              </div>
            </RadioGroup>
          </div>

          <Textarea
            name="notas"
            placeholder="Notas adicionales"
            value={formData.notas}
            onChange={handleChange}
          />
        </CardContent>
      </Card>

      {/* RESUMEN */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Dispositivo:</span>
              <span>
                {formData.tipo_dispositivo
                  ? `${formData.tipo_dispositivo} ${formData.modelo}`
                  : "No especificado"}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Tool className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Problema:</span>
              <span className="truncate">
                {formData.problema
                  ? formData.problema.substring(0, 50) +
                    (formData.problema.length > 50 ? "..." : "")
                  : "No especificado"}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Fecha de ingreso:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Costo estimado:</span>
              <span>${formData.costo_estimado || "0.00"}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/ordenes">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear Orden"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</form>
    </div>
  )
}
