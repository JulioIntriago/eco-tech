"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Printer, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EstadoOrden = 'pendiente' | 'en_proceso' | 'finalizado' | 'entregado' | 'activo';

type Orden = {
  id: string;
  dispositivo: string;
  modelo: string;
  problema: string;
  estado: EstadoOrden;
  fecha_ingreso: string | null;
  fecha_entrega: string | null;
  costo_estimado: number;
  notas: string;
  clientes: {
    nombre: string;
    telefono: string;
    correo: string;
    direccion: string;
  };
  empleados: {
    nombre: string;
    cargo: string;
  };
};

function traducirEstado(estado: EstadoOrden): string {
  const traducciones: Record<EstadoOrden, string> = {
    pendiente: "Pendiente",
    en_proceso: "En Proceso",
    finalizado: "Finalizado",
    entregado: "Entregado",
    activo: "Activo",
  };
  return traducciones[estado];
}

function getVariantForEstado(estado: EstadoOrden): "default" | "secondary" | "success" | "outline" {
  const variantes: Record<EstadoOrden, "default" | "secondary" | "success" | "outline"> = {
    pendiente: "secondary",
    en_proceso: "default",
    finalizado: "success",
    entregado: "outline",
    activo: "success",
  };
  return variantes[estado];
}

export default function DetalleOrdenPage() {
  const router = useRouter();
  const params = useParams();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoOrden | null>(null);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    const fetchOrden = async () => {
      const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
      if (!id) {
        setError("No se encontró el ID de la orden.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ordenes")
          .select(`
            id, dispositivo, modelo, problema, estado, fecha_ingreso, fecha_entrega, costo_estimado, notas,
            clientes:cliente_id (nombre, telefono, correo, direccion),
            empleados:tecnico_id (nombre, cargo)
          `)
          .eq("id", id)
          .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error("No se encontró la orden con el ID proporcionado.");

        setOrden(data as unknown as Orden);
        setNuevoEstado(data.estado); // estado inicial
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrden();
  }, [params?.id]);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta orden?")) return;
    try {
      const id = orden?.id;
      if (!id) return;
      const { error } = await supabase.from("ordenes").delete().eq("id", id);
      if (error) throw new Error(error.message);
      alert("Orden eliminada con éxito.");
      router.push("/dashboard/ordenes");
      router.refresh() 
    } catch (error: any) {
      alert(`Error al eliminar la orden: ${error.message}`);
    }
  };

  const handleActualizarEstado = async () => {
    if (!orden || !nuevoEstado || orden.estado === nuevoEstado) return;

    setActualizandoEstado(true);
    const { error } = await supabase
      .from("ordenes")
      .update({ estado: nuevoEstado })
      .eq("id", orden.id);

    if (error) {
      alert("Error al actualizar el estado.");
    } else {
      setOrden({ ...orden, estado: nuevoEstado });
      alert("Estado actualizado con éxito.");
      await fetchOrdenes(); // 🔁 recarga la orden actualizada desde Supabase

      
    }

    setActualizandoEstado(false);
  };

  if (loading) return <div className="p-6">Cargando...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!orden) return <div className="p-6 text-gray-500">No hay datos disponibles para esta orden.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      
      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/ordenes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Orden #{orden.id}</h2>
        <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
      </div>

      {/* Acciones */}
      <div className="flex gap-4 justify-end flex-wrap">
        <Button variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/ordenes/${orden.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Select value={nuevoEstado ?? ""} onValueChange={(val) => setNuevoEstado(val as EstadoOrden)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Actualizar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_proceso">En Proceso</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleActualizarEstado} disabled={actualizandoEstado || nuevoEstado === orden.estado}>
            Guardar estado
          </Button>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>
      <Button variant="secondary" size="sm" asChild>
    <a
      href={`https://wa.me/${orden.clientes.telefono.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hola ${orden.clientes.nombre}, te saludamos de Fixie. Tu orden (ID: ${orden.id}) está actualmente en estado: ${traducirEstado(orden.estado)}.`
      )}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 448 512" fill="currentColor">
        <path d="M380.9 97.1C339-13.3 201.1-29.5 120.5 43.4 56.4 98.8 35.2 192 76.5 263.7L32 480l221.3-58.6c71.6 36.6 161.5-8.9 199.6-87.7 38.1-78.8 10.2-176.1-72-236.6zM232 393.4c-15.7 0-31.3-2.9-45.9-8.6L94.1 432l47.1-91.9c-35.9-35.4-52.3-87.1-43.4-136.7 14.1-81.8 98.6-140.5 186-126.6 87.5 13.8 148.3 100.2 134.3 182-12.7 76.7-80.5 132.3-155.1 132.3z" />
      </svg>
      WhatsApp
    </a>
  </Button>
      {/* Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Información del Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p><strong>Nombre:</strong> {orden.clientes.nombre}</p>
            <p><strong>Teléfono:</strong> {orden.clientes.telefono}</p>
            <p><strong>Correo:</strong> {orden.clientes.correo}</p>
            <p><strong>Dirección:</strong> {orden.clientes.direccion}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Información del Dispositivo</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <p><strong>Tipo:</strong> {orden.dispositivo}</p>
            <p><strong>Modelo:</strong> {orden.modelo}</p>
            <p><strong>Problema:</strong> {orden.problema}</p>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader><CardTitle>Detalles de la Reparación</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Fecha de Ingreso:</strong> {orden.fecha_ingreso || "No disponible"}</p>
            <p><strong>Fecha de Entrega Estimada:</strong> {orden.fecha_entrega || "Pendiente"}</p>
            <p><strong>Costo Estimado:</strong> ${orden.costo_estimado.toFixed(2)}</p>
            <p><strong>Técnico Asignado:</strong> {orden.empleados?.nombre || "No asignado"}</p>
            <div className="flex items-center gap-2">
              <strong>Estado Actual:</strong>
              <Badge variant={getVariantForEstado(orden.estado)}>{traducirEstado(orden.estado)}</Badge>
            </div>
            <p><strong>Notas:</strong> {orden.notas || "Sin notas adicionales."}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function fetchOrdenes() {
  throw new Error("Function not implemented.");
}

