"use client"

import type React from "react"

import { useState } from "react"
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
  // Estado para la configuración general
  const [configGeneral, setConfigGeneral] = useState({
    nombreEmpresa: "Eco_Tech",
    direccion: "Calle Principal 123, Ciudad",
    telefono: "555-123-4567",
    correo: "contacto@ecotech.com",
    sitioWeb: "www.ecotech.com",
    logo: "",
  })

  // Estado para la configuración de notificaciones
  const [configNotificaciones, setConfigNotificaciones] = useState({
    notificarStockBajo: true,
    notificarNuevasOrdenes: true,
    notificarVentas: true,
    notificarPagos: true,
    correoNotificaciones: "notificaciones@ecotech.com",
  })

  // Estado para la configuración de facturación
  const [configFacturacion, setConfigFacturacion] = useState({
    moneda: "MXN",
    impuesto: "16",
    prefijo: "ECO-",
    terminosPago: "Pago al contado o con tarjeta. No se aceptan devoluciones después de 15 días.",
    notaFactura: "Gracias por su preferencia.",
  })

  // Estado para la configuración de usuarios
  const [configUsuarios, setConfigUsuarios] = useState({
    permitirRegistro: false,
    aprobacionManual: true,
    rolPredeterminado: "vendedor",
  })

  // Manejadores de cambios
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfigGeneral((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificacionesChange = (name: string, value: boolean | string) => {
    setConfigNotificaciones((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFacturacionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setConfigFacturacion((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (section: string, name: string, value: string) => {
    if (section === "facturacion") {
      setConfigFacturacion((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else if (section === "usuarios") {
      setConfigUsuarios((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleUsuariosChange = (name: string, value: boolean | string) => {
    setConfigUsuarios((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Guardar configuración
  const guardarConfiguracion = () => {
    // Aquí iría la lógica para guardar en Supabase
    console.log("Configuración guardada:", {
      general: configGeneral,
      notificaciones: configNotificaciones,
      facturacion: configFacturacion,
      usuarios: configUsuarios,
    })

    // Mostrar mensaje de éxito
    alert("Configuración guardada correctamente")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <Button onClick={guardarConfiguracion}>
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>Configura la información básica de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed">
                  <Smartphone className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-sm font-medium">Logo de la Empresa</h3>
                  <p className="text-xs text-muted-foreground">Sube el logo de tu empresa en formato PNG o JPG</p>
                  <Input type="file" accept="image/*" className="w-full max-w-xs" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                <Input
                  id="nombreEmpresa"
                  name="nombreEmpresa"
                  value={configGeneral.nombreEmpresa}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" value={configGeneral.direccion} onChange={handleGeneralChange} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" name="telefono" value={configGeneral.telefono} onChange={handleGeneralChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico</Label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    value={configGeneral.correo}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sitioWeb">Sitio Web</Label>
                <Input id="sitioWeb" name="sitioWeb" value={configGeneral.sitioWeb} onChange={handleGeneralChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Personaliza las notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarStockBajo">Notificar Stock Bajo</Label>
                    <p className="text-xs text-muted-foreground">
                      Recibe alertas cuando los productos tengan stock bajo
                    </p>
                  </div>
                  <Switch
                    id="notificarStockBajo"
                    checked={configNotificaciones.notificarStockBajo}
                    onCheckedChange={(value) => handleNotificacionesChange("notificarStockBajo", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarNuevasOrdenes">Notificar Nuevas Órdenes</Label>
                    <p className="text-xs text-muted-foreground">
                      Recibe alertas cuando se registren nuevas órdenes de trabajo
                    </p>
                  </div>
                  <Switch
                    id="notificarNuevasOrdenes"
                    checked={configNotificaciones.notificarNuevasOrdenes}
                    onCheckedChange={(value) => handleNotificacionesChange("notificarNuevasOrdenes", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarVentas">Notificar Ventas</Label>
                    <p className="text-xs text-muted-foreground">Recibe alertas cuando se completen ventas</p>
                  </div>
                  <Switch
                    id="notificarVentas"
                    checked={configNotificaciones.notificarVentas}
                    onCheckedChange={(value) => handleNotificacionesChange("notificarVentas", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarPagos">Notificar Pagos</Label>
                    <p className="text-xs text-muted-foreground">Recibe alertas sobre pagos pendientes o completados</p>
                  </div>
                  <Switch
                    id="notificarPagos"
                    checked={configNotificaciones.notificarPagos}
                    onCheckedChange={(value) => handleNotificacionesChange("notificarPagos", value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="correoNotificaciones">Correo para Notificaciones</Label>
                <Input
                  id="correoNotificaciones"
                  type="email"
                  value={configNotificaciones.correoNotificaciones}
                  onChange={(e) => handleNotificacionesChange("correoNotificaciones", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Facturación</CardTitle>
              <CardDescription>Personaliza la información de facturación y pagos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={configFacturacion.moneda}
                    onValueChange={(value) => handleSelectChange("facturacion", "moneda", value)}
                  >
                    <SelectTrigger id="moneda">
                      <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                      <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impuesto">Impuesto (%)</Label>
                  <Input
                    id="impuesto"
                    name="impuesto"
                    type="number"
                    min="0"
                    max="100"
                    value={configFacturacion.impuesto}
                    onChange={handleFacturacionChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefijo">Prefijo para Facturas</Label>
                <Input
                  id="prefijo"
                  name="prefijo"
                  value={configFacturacion.prefijo}
                  onChange={handleFacturacionChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terminosPago">Términos de Pago</Label>
                <Textarea
                  id="terminosPago"
                  name="terminosPago"
                  rows={3}
                  value={configFacturacion.terminosPago}
                  onChange={handleFacturacionChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notaFactura">Nota en Facturas</Label>
                <Textarea
                  id="notaFactura"
                  name="notaFactura"
                  rows={2}
                  value={configFacturacion.notaFactura}
                  onChange={handleFacturacionChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Usuarios</CardTitle>
              <CardDescription>Administra las opciones de usuarios y permisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permitirRegistro">Permitir Registro de Usuarios</Label>
                    <p className="text-xs text-muted-foreground">
                      Permite que nuevos usuarios se registren en el sistema
                    </p>
                  </div>
                  <Switch
                    id="permitirRegistro"
                    checked={configUsuarios.permitirRegistro}
                    onCheckedChange={(value) => handleUsuariosChange("permitirRegistro", value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="aprobacionManual">Aprobación Manual de Usuarios</Label>
                    <p className="text-xs text-muted-foreground">Requiere aprobación manual para nuevos usuarios</p>
                  </div>
                  <Switch
                    id="aprobacionManual"
                    checked={configUsuarios.aprobacionManual}
                    onCheckedChange={(value) => handleUsuariosChange("aprobacionManual", value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="rolPredeterminado">Rol Predeterminado</Label>
                <Select
                  value={configUsuarios.rolPredeterminado}
                  onValueChange={(value) => handleSelectChange("usuarios", "rolPredeterminado", value)}
                >
                  <SelectTrigger id="rolPredeterminado">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">Rol asignado a los nuevos usuarios al registrarse</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

