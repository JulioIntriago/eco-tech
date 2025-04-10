"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DetalleEmpleadoPage() {
  const router = useRouter();
  const params = useParams();
  const [empleado, setEmpleado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpleado = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No se encontró el usuario con el ID proporcionado.");

      setEmpleado(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
    if (id) fetchEmpleado(id);
  }, [params?.id]);

  const handleEliminar = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    try {
      const { error } = await supabase.from("usuarios").delete().eq("id", empleado.id);
      if (error) throw new Error(error.message);
      alert("Usuario eliminado con éxito.");
      router.push("/dashboard/empleados");
      router.refresh();
    } catch (error: any) {
      alert(`Error al eliminar el usuario: ${error.message}`);
    }
  };

  if (loading) return <div className="p-6">Cargando usuario...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!empleado) return <div className="p-6 text-gray-500">No se encontró el usuario.</div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/empleados">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Usuario #{empleado.id}</h2>
        <Badge variant={empleado.estado === "activo" ? "success" : "secondary"}>{empleado.estado}</Badge>
      </div>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/empleados/${empleado.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={handleEliminar}>
          <Trash className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Nombre:</strong> {empleado.nombre}</p>
          <p><strong>Rol:</strong> {empleado.rol}</p>
          <p><strong>Teléfono:</strong> {empleado.telefono}</p>
          <p><strong>Correo:</strong> {empleado.correo}</p>
          <p><strong>Dirección:</strong> {empleado.direccion}</p>
          <p><strong>Fecha de Contratación:</strong> {empleado.fecha_contratacion || "—"}</p>
          <p><strong>Notas:</strong> {empleado.notas || "Sin notas adicionales"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
