import { supabase } from "@/lib/supabase"

export async function getConfiguracionEmpresa(empresaId: string) {
  const { data, error } = await supabase
    .from("configuracion")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle()

  if (error) {
    console.error("❌ Error obteniendo configuración de la empresa:", error)
    return null
  }

  return data
}
