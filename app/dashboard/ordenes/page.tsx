"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserPerfil } from "@/lib/user-utils";
import { traducirEstado, getEstadoBadgeVariant } from "@/lib/estado-utils"

interface OrdenRaw {
  id: string;
  dispositivo: string;
  problema: string;
  estado: string;
  fecha_ingreso: string;
  fecha_entrega: string | null;
  costo_estimado: number;
  prioridad: string;
  clientes: { nombre: string } | null;
  empleados: { id: string; nombre: string } | null;
}

interface Orden {
  id: string;
  cliente: string;
  dispositivo: string;
  problema: string;
  estado: string;
  fecha_ingreso: string;
  fecha_entrega: string;
  costo_estimado: number;
  prioridad: string;
  tecnico_asignado: string;
}

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrdenes = async () => {
    try {
      const perfil = await getUserPerfil();
      if (!perfil) return;

      const { rol, id: perfil_id, empresa_id } = perfil;

      const { data, error } = await supabase
        .from("ordenes")
        .select(`
          id, dispositivo, problema, estado, fecha_ingreso, prioridad, fecha_entrega, costo_estimado,
          clientes:cliente_id (nombre),
          empleados:tecnico_id (id, nombre)
        `)
        .eq("empresa_id", empresa_id)
        .order("fecha_ingreso", { ascending: false });

      if (error) throw error;

      const ordenesMapeadas = (data as unknown as OrdenRaw[]).filter((orden) =>
        rol === "tecnico" ? orden.empleados?.id === perfil_id : true
      ).map((orden) => ({
        id: orden.id,
        cliente: orden.clientes?.nombre || "Sin cliente",
        dispositivo: orden.dispositivo,
        problema: orden.problema,
        estado: orden.estado,
        fecha_ingreso: orden.fecha_ingreso,
        fecha_entrega: orden.fecha_entrega || "No definida",
        costo_estimado: orden.costo_estimado,
        prioridad: orden.prioridad || "normal",
        tecnico_asignado: orden.empleados?.nombre || "Sin asignar",
      }));

      setOrdenes(ordenesMapeadas);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    const canal = supabase.channel("ordenes_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ordenes" }, fetchOrdenes)
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  const ordenesFiltradas = ordenes.filter((orden) =>
    [orden.id, orden.cliente, orden.dispositivo, orden.problema].some(val =>
      val.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase.from("ordenes").update({ estado: nuevoEstado }).eq("id", id);
    if (!error) {
      setOrdenes((prev) => prev.map((o) => o.id === id ? { ...o, estado: nuevoEstado } : o));
    } else {
      alert("Error al actualizar el estado");
    }
  };

  const getPrioridadVariant = (prioridad: string): "outline" | "secondary" | "destructive" => {
    if (prioridad === "baja") return "outline";
    if (prioridad === "alta") return "destructive";
    return "secondary";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
        <Button asChild>
          <Link href="/dashboard/ordenes/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por ID, cliente o dispositivo..."
          className="w-full pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Órdenes</CardTitle>
          <CardDescription>Gestiona las órdenes de reparación</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Dispositivo</TableHead>
                <TableHead className="hidden lg:table-cell">Problema</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Prioridad</TableHead>
                <TableHead className="hidden lg:table-cell">Técnico</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordenesFiltradas.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell>{orden.id.slice(0, 8)}</TableCell>
                  <TableCell>{orden.cliente}</TableCell>
                  <TableCell className="hidden md:table-cell">{orden.dispositivo}</TableCell>
                  <TableCell className="hidden lg:table-cell">{orden.problema}</TableCell>

                  <TableCell>
                    
  <Select value={orden.estado} onValueChange={(val) => actualizarEstado(orden.id, val)}>
  <SelectTrigger className="w-[140px] h-[36px] rounded-md border px-3 text-sm">
  <SelectValue>
  <span className={`text-sm font-medium ${
    orden.estado === "pendiente" ? "text-yellow-600" :
    orden.estado === "en_proceso" ? "text-blue-600" :
    orden.estado === "finalizado" ? "text-green-600" :
    orden.estado === "entregado" ? "text-gray-500" :
    "text-red-600"
  }`}>
    {traducirEstado(orden.estado)}
  </span>
</SelectValue>


    </SelectTrigger>
    <SelectContent>
      {["pendiente", "en_proceso", "finalizado", "entregado", "activo"].map((estado) => (
        <SelectItem key={estado} value={estado}>
          <Badge variant={getEstadoBadgeVariant(estado)}>
            {traducirEstado(estado)}
          </Badge>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</TableCell>


                  <TableCell className="hidden md:table-cell">
                    <Badge variant={getPrioridadVariant(orden.prioridad)}>
                      {orden.prioridad.charAt(0).toUpperCase() + orden.prioridad.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{orden.tecnico_asignado}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/ordenes/${orden.id}`}>Ver Detalles</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
