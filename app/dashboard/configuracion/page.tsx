"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Smartphone, Save } from "lucide-react"

export default function ConfiguracionPage() {
  const [configId, setConfigId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [configGeneral, setConfigGeneral] = useState({
    nombreEmpresa: "Eco_Tech",
    direccion: "Calle Principal 123, Ciudad",
    telefono: "555-123-4567",
    correo: "contacto@ecotech.com",
    sitioWeb: "www.ecotech.com",
    logo: "",
  })

  const [configNotificaciones, setConfigNotificaciones] = useState({
    notificarStockBajo: true,
    notificarNuevasOrdenes: true,
    notificarVentas: true,
    notificarPagos: true,
    correoNotificaciones: "notificaciones@ecotech.com",
  })

  const [configFacturacion, setConfigFacturacion] = useState({
    moneda: "EC",
    impuesto: "12",
    prefijo: "ECO-",
    terminosPago:
      "Pago al contado o con tarjeta. No se aceptan devoluciones después de 15 días.",
    notaFactura: "Gracias por su preferencia.",
  })

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from("configuracion").select("*").maybeSingle()
      if (data) {
        setConfigId(data.id)
        setConfigGeneral({
          nombreEmpresa: data.nombre_empresa || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          correo: data.correo || "",
          sitioWeb: data.sitio_web || "",
          logo: data.logo || "",
        })
        setConfigNotificaciones({
          notificarStockBajo: data.notificar_stock_bajo,
          notificarNuevasOrdenes: data.notificar_nuevas_ordenes,
          notificarVentas: data.notificar_ventas,
          notificarPagos: data.notificar_pagos,
          correoNotificaciones: data.correo_notificaciones || "",
        })
        setConfigFacturacion({
          moneda: data.moneda || "MXN",
          impuesto: data.impuesto || "",
          prefijo: data.prefijo || "",
          terminosPago: data.terminos_pago || "",
          notaFactura: data.nota_factura || "",
        })
      }
      setIsLoading(false)
    }
    fetchConfig()
  }, [])

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfigGeneral((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const handleNotificacionesChange = (name: string, value: boolean | string) => {
    setConfigNotificaciones((prev) => ({ ...prev, [name]: value }))
  }

  const handleFacturacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfigFacturacion((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setConfigFacturacion((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async () => {
    if (!logoFile) return
    const fileExt = logoFile.name.split(".").pop()
    const fileName = `logo_${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from("logos").upload(fileName, logoFile)
    if (error) throw error
    const url = supabase.storage.from("logos").getPublicUrl(fileName).data.publicUrl
    setConfigGeneral((prev) => ({ ...prev, logo: url }))
  }

  const guardarConfiguracion = async () => {
    try {
      if (logoFile) await handleFileUpload()
      const payload = {
        nombre_empresa: configGeneral.nombreEmpresa,
        direccion: configGeneral.direccion,
        telefono: configGeneral.telefono,
        correo: configGeneral.correo,
        sitio_web: configGeneral.sitioWeb,
        logo: configGeneral.logo,
        notificar_stock_bajo: configNotificaciones.notificarStockBajo,
        notificar_nuevas_ordenes: configNotificaciones.notificarNuevasOrdenes,
        notificar_ventas: configNotificaciones.notificarVentas,
        notificar_pagos: configNotificaciones.notificarPagos,
        correo_notificaciones: configNotificaciones.correoNotificaciones,
        moneda: configFacturacion.moneda,
        impuesto: configFacturacion.impuesto,
        prefijo: configFacturacion.prefijo,
        terminos_pago: configFacturacion.terminosPago,
        nota_factura: configFacturacion.notaFactura,
      }

      const { error } = configId
        ? await supabase.from("configuracion").update(payload).eq("id", configId)
        : await supabase.from("configuracion").insert(payload)

      if (error) throw error
      alert("Configuración guardada correctamente")
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      alert("Error al guardar configuración. Revisa la consola.")
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[50vh]">Cargando configuración...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <Button onClick={guardarConfiguracion}>
          <Save className="mr-2 h-4 w-4" /> Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          <TabsTrigger value="usuarios">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Información básica de tu empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configGeneral.logo && (
                <div className="w-24 h-24 rounded-md overflow-hidden border">
                  <img src={configGeneral.logo} alt="Logo actual" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la Empresa</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Empresa</Label>
                  <Input name="nombreEmpresa" value={configGeneral.nombreEmpresa} onChange={handleGeneralChange} />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input name="direccion" value={configGeneral.direccion} onChange={handleGeneralChange} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input name="telefono" value={configGeneral.telefono} onChange={handleGeneralChange} />
                </div>
                <div>
                  <Label>Correo</Label>
                  <Input name="correo" value={configGeneral.correo} onChange={handleGeneralChange} />
                </div>
                <div>
                  <Label>Sitio Web</Label>
                  <Input name="sitioWeb" value={configGeneral.sitioWeb} onChange={handleGeneralChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura alertas del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {["notificarStockBajo", "notificarNuevasOrdenes", "notificarVentas", "notificarPagos"].map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={key}>{key.replace("notificar", "Notificar ")}</Label>
                  </div>
                  <Switch
                    id={key}
                    checked={configNotificaciones[key as keyof typeof configNotificaciones] as boolean}
                    onCheckedChange={(value) => handleNotificacionesChange(key, value)}
                  />
                </div>
              ))}
              <div className="pt-4 space-y-2">
                <Label>Correo para Notificaciones</Label>
                <Input
                  type="email"
                  value={configNotificaciones.correoNotificaciones}
                  onChange={(e) => handleNotificacionesChange("correoNotificaciones", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion">
          <Card>
            <CardHeader>
              <CardTitle>Facturación</CardTitle>
              <CardDescription>Parámetros de facturación del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Moneda</Label>
                  <Select value={configFacturacion.moneda} onValueChange={(val) => handleSelectChange("moneda", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="EC">EC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Impuesto (%)</Label>
                  <Input name="impuesto" value={configFacturacion.impuesto} onChange={handleFacturacionChange} />
                </div>
                <div>
                  <Label>Prefijo de Factura</Label>
                  <Input name="prefijo" value={configFacturacion.prefijo} onChange={handleFacturacionChange} />
                </div>
              </div>
              <div>
                <Label>Términos de Pago</Label>
                <Textarea name="terminosPago" value={configFacturacion.terminosPago} onChange={handleFacturacionChange} />
              </div>
              <div>
                <Label>Nota en Factura</Label>
                <Textarea name="notaFactura" value={configFacturacion.notaFactura} onChange={handleFacturacionChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de Usuarios</CardTitle>
              <CardDescription>Define políticas de seguridad para tu equipo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tiempoSesion">Tiempo de Sesión Inactiva (minutos)</Label>
                <Input id="tiempoSesion" type="number" defaultValue="60" />
                <p className="text-xs text-muted-foreground">Tiempo de inactividad antes de cerrar sesión automáticamente</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="politicaContrasenas">Política de Contraseñas</Label>
                <Select defaultValue="media">
                  <SelectTrigger id="politicaContrasenas">
                    <SelectValue placeholder="Selecciona una política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Básica (mínimo 6 caracteres)</SelectItem>
                    <SelectItem value="media">Media (mínimo 8 caracteres, incluir números)</SelectItem>
                    <SelectItem value="alta">Alta (mínimo 10 caracteres, incluir números y símbolos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
