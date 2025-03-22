"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    terminosPago: "Pago al contado o con tarjeta. No se aceptan devoluciones después de 15 días.",
    notaFactura: "Gracias por su preferencia.",
  })

  const [configUsuarios, setConfigUsuarios] = useState({
    permitirRegistro: false,
    aprobacionManual: true,
    rolPredeterminado: "vendedor",
  })

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase.from("configuracion").select("*").maybeSingle()
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
        setConfigUsuarios({
          permitirRegistro: data.permitir_registro,
          aprobacionManual: data.aprobacion_manual,
          rolPredeterminado: data.rol_predeterminado || "vendedor",
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

  const handleSelectChange = (section: string, name: string, value: string) => {
    if (section === "facturacion") {
      setConfigFacturacion((prev) => ({ ...prev, [name]: value }))
    } else if (section === "usuarios") {
      setConfigUsuarios((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleUsuariosChange = (name: string, value: boolean | string) => {
    setConfigUsuarios((prev) => ({ ...prev, [name]: value }))
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
        permitir_registro: configUsuarios.permitirRegistro,
        aprobacion_manual: configUsuarios.aprobacionManual,
        rol_predeterminado: configUsuarios.rolPredeterminado,
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
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>Configura la información básica del negocio</CardDescription>
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
              <CardDescription>Opciones de alertas automáticas por correo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Correo de Notificaciones</Label>
                <Input value={configNotificaciones.correoNotificaciones} onChange={(e) => handleNotificacionesChange("correoNotificaciones", e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <Label>Stock Bajo</Label>
                  <Switch checked={configNotificaciones.notificarStockBajo} onCheckedChange={(val) => handleNotificacionesChange("notificarStockBajo", val)} />
                </div>
                <div className="flex justify-between items-center">
                  <Label>Nuevas Órdenes</Label>
                  <Switch checked={configNotificaciones.notificarNuevasOrdenes} onCheckedChange={(val) => handleNotificacionesChange("notificarNuevasOrdenes", val)} />
                </div>
                <div className="flex justify-between items-center">
                  <Label>Ventas</Label>
                  <Switch checked={configNotificaciones.notificarVentas} onCheckedChange={(val) => handleNotificacionesChange("notificarVentas", val)} />
                </div>
                <div className="flex justify-between items-center">
                  <Label>Pagos</Label>
                  <Switch checked={configNotificaciones.notificarPagos} onCheckedChange={(val) => handleNotificacionesChange("notificarPagos", val)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion">
          <Card>
            <CardHeader>
              <CardTitle>Facturación</CardTitle>
              <CardDescription>Configuración de impuestos, prefijos y notas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Moneda</Label>
                  <Select value={configFacturacion.moneda} onValueChange={(val) => handleSelectChange("facturacion", "moneda", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
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
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Configuraciones para nuevos registros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <Label>Permitir Registro</Label>
                  <Switch checked={configUsuarios.permitirRegistro} onCheckedChange={(val) => handleUsuariosChange("permitirRegistro", val)} />
                </div>
                <div className="flex justify-between items-center">
                  <Label>Aprobación Manual</Label>
                  <Switch checked={configUsuarios.aprobacionManual} onCheckedChange={(val) => handleUsuariosChange("aprobacionManual", val)} />
                </div>
              </div>
              <div>
                <Label>Rol Predeterminado</Label>
                <Select value={configUsuarios.rolPredeterminado} onValueChange={(val) => handleSelectChange("usuarios", "rolPredeterminado", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
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
