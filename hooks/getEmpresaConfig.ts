import { supabase } from "@/lib/supabase"

export async function getEmpresaConfig() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null

  const empresaId = userData.user.user_metadata?.empresa_id
  if (!empresaId) return null

  const { data, error } = await supabase
    .from("configuracion")
    .select("*")
    .eq("empresa_id", empresaId)
    .maybeSingle()

  if (error) {
    console.error("Error al obtener configuración:", error)
    return null
  }

  return data
}
