export const traducirEstado = (estado: string): string => {
    const traducciones: Record<string, string> = {
      pendiente: "Pendiente",
      en_proceso: "En Proceso",
      finalizado: "Finalizado",
      entregado: "Entregado",
      activo: "Activo",
      estado_actualizado: "Actualizado",
    };
    return traducciones[estado] || estado;
  };
  
  export const getEstadoBadgeVariant = (estado: string): "default" | "secondary" | "success" | "destructive" | "outline" => {
    switch (estado) {
      case "pendiente": return "secondary";
      case "en_proceso": return "default";
      case "finalizado": return "success";
      case "entregado": return "outline";
      case "activo": return "destructive";
      default: return "default";
    }
  };
  